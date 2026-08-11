import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z
  .object({
    name: z.string().trim().min(2).max(80),
    address: z.string().trim().min(2).max(120),
    neighborhood: z.string().trim().min(2).max(60),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    creditsPerHour: z.number().int().min(1).max(100),
    capacity: z.number().int().min(1).max(5000),
    description: z.string().trim().min(10).max(600),
    amenities: z.array(z.string().trim()).max(12),
    openHour: z.number().int().min(0).max(24),
    closeHour: z.number().int().min(0).max(24),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    listed: z.boolean(),
  })
  .partial();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OPERATOR") {
    return NextResponse.json({ error: "Operator access required" }, { status: 403 });
  }

  const existing = await prisma.garage.findUnique({ where: { id: params.id } });
  if (!existing || existing.ownerId !== user.id) {
    return NextResponse.json({ error: "Garage not found" }, { status: 404 });
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
      { error: parsed.error.issues[0]?.message ?? "Invalid garage details" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  // Keep spotsAvailable consistent when capacity changes: preserve the number
  // of occupied spots, clamp availability into the new capacity.
  let spotsAvailable = existing.spotsAvailable;
  if (typeof d.capacity === "number") {
    const occupied = Math.max(0, existing.capacity - existing.spotsAvailable);
    spotsAvailable = Math.max(0, Math.min(d.capacity, d.capacity - occupied));
  }

  const garage = await prisma.garage.update({
    where: { id: existing.id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.address !== undefined && { address: d.address }),
      ...(d.neighborhood !== undefined && { neighborhood: d.neighborhood }),
      ...(d.lat !== undefined && { lat: d.lat }),
      ...(d.lng !== undefined && { lng: d.lng }),
      ...(d.creditsPerHour !== undefined && { creditsPerHour: d.creditsPerHour }),
      ...(d.capacity !== undefined && { capacity: d.capacity, spotsAvailable }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.amenities !== undefined && { amenities: d.amenities.join(",") }),
      ...(d.openHour !== undefined && { openHour: d.openHour }),
      ...(d.closeHour !== undefined && { closeHour: d.closeHour }),
      ...(d.accent !== undefined && { accent: d.accent }),
      ...(d.listed !== undefined && { listed: d.listed }),
    },
  });

  return NextResponse.json({ ok: true, id: garage.id, slug: garage.slug });
}
