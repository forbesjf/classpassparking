import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const MAX_HOURS = 24;

const schema = z.object({
  garageId: z.string().min(1),
  startTime: z.string().datetime(),
  hours: z.number().int().min(1).max(MAX_HOURS),
  vehiclePlate: z.string().trim().max(12).optional().default(""),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid booking" },
      { status: 400 }
    );
  }

  const { garageId, startTime, hours, vehiclePlate } = parsed.data;
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
  }
  if (start.getTime() < Date.now() - 60 * 1000) {
    return NextResponse.json(
      { error: "Start time must be in the future" },
      { status: 400 }
    );
  }
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const garage = await tx.garage.findUnique({ where: { id: garageId } });
      if (!garage) throw new Error("Garage not found");
      if (garage.spotsAvailable <= 0) throw new Error("This garage is full");

      const cost = garage.creditsPerHour * hours;

      const freshUser = await tx.user.findUnique({ where: { id: user.id } });
      if (!freshUser) throw new Error("Account not found");
      if (freshUser.credits < cost) {
        throw new Error(
          `Not enough credits — this booking needs ${cost}, you have ${freshUser.credits}`
        );
      }

      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: cost } },
      });
      await tx.garage.update({
        where: { id: garage.id },
        data: { spotsAvailable: { decrement: 1 } },
      });

      const created = await tx.booking.create({
        data: {
          userId: user.id,
          garageId: garage.id,
          startTime: start,
          endTime: end,
          hours,
          creditsCost: cost,
          vehiclePlate,
          status: "CONFIRMED",
        },
      });

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -cost,
          type: "BOOKING",
          description: `Parking at ${garage.name} · ${hours}h`,
          bookingId: created.id,
        },
      });

      return created;
    });

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create booking";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
