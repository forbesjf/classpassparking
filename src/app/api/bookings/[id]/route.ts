import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  action: z.enum(["cancel", "checkin", "complete"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  const { action } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: params.id },
      });
      if (!booking || booking.userId !== user.id) {
        throw new Error("Booking not found");
      }

      if (action === "cancel") {
        if (booking.status !== "CONFIRMED") {
          throw new Error("Only upcoming bookings can be cancelled");
        }
        // Refund credits and free the spot.
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { increment: booking.creditsCost } },
        });
        await tx.garage.update({
          where: { id: booking.garageId },
          data: { spotsAvailable: { increment: 1 } },
        });
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" },
        });
        await tx.creditTransaction.create({
          data: {
            userId: user.id,
            amount: booking.creditsCost,
            type: "REFUND",
            description: "Refund for cancelled booking",
            bookingId: booking.id,
          },
        });
      } else if (action === "checkin") {
        if (booking.status !== "CONFIRMED") {
          throw new Error("This booking can't be checked in");
        }
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "ACTIVE", checkedInAt: new Date() },
        });
      } else if (action === "complete") {
        if (booking.status !== "ACTIVE") {
          throw new Error("Only active sessions can be completed");
        }
        // Free the spot back to the garage on checkout.
        await tx.garage.update({
          where: { id: booking.garageId },
          data: { spotsAvailable: { increment: 1 } },
        });
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
