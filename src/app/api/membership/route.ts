import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  planKey: z.enum(["free", "starter", "commuter", "unlimited"]),
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
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const { planKey } = parsed.data;

  if (planKey === user.planKey) {
    return NextResponse.json(
      { error: "You're already on that plan" },
      { status: 400 }
    );
  }

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        planKey,
        // Grant this month's credit allotment when moving onto a paid plan.
        ...(plan.monthlyCredits > 0
          ? { credits: { increment: plan.monthlyCredits } }
          : {}),
      },
    });
    if (plan.monthlyCredits > 0) {
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: plan.monthlyCredits,
          type: "PLAN_CHANGE",
          description: `Switched to ${plan.name} — monthly credits added`,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
