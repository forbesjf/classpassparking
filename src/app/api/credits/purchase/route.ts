import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCreditPack } from "@/lib/credits";

const schema = z.object({
  packId: z.string().min(1),
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
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  // Credits and price come from the server-side pack, never the client.
  const pack = getCreditPack(parsed.data.packId);
  if (!pack) {
    return NextResponse.json({ error: "Unknown credit pack" }, { status: 404 });
  }

  const dollars = (pack.priceCents / 100).toFixed(2);

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: user.id },
      data: { credits: { increment: pack.credits } },
    });
    await tx.creditTransaction.create({
      data: {
        userId: user.id,
        amount: pack.credits,
        type: "PURCHASE",
        description: `Purchased ${pack.credits} credits — $${dollars}`,
      },
    });
    return u;
  });

  return NextResponse.json({ ok: true, credits: updated.credits });
}
