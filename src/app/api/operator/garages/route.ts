import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  address: z.string().trim().min(2).max(120),
  neighborhood: z.string().trim().min(2).max(60),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  creditsPerHour: z.number().int().min(1).max(100),
  capacity: z.number().int().min(1).max(5000),
  description: z.string().trim().min(10).max(600),
  amenities: z.array(z.string().trim()).max(12).default([]),
  openHour: z.number().int().min(0).max(24).default(0),
  closeHour: z.number().int().min(0).max(24).default(24),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#17b478"),
  listed: z.boolean().default(true),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OPERATOR") {
    return NextResponse.json({ error: "Operator access required" }, { status: 403 });
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

  // Build a unique slug.
  const base = slugify(d.name) || "garage";
  let slug = base;
  let n = 2;
  while (await prisma.garage.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  const garage = await prisma.garage.create({
    data: {
      slug,
      name: d.name,
      address: d.address,
      neighborhood: d.neighborhood,
      lat: d.lat,
      lng: d.lng,
      creditsPerHour: d.creditsPerHour,
      capacity: d.capacity,
      spotsAvailable: d.capacity,
      description: d.description,
      amenities: d.amenities.join(","),
      openHour: d.openHour,
      closeHour: d.closeHour,
      accent: d.accent,
      listed: d.listed,
      ownerId: user.id,
    },
  });

  return NextResponse.json({ ok: true, id: garage.id, slug: garage.slug });
}
