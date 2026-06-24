import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseStoredAiAnalysis } from "@/lib/ai-analysis";
import { decisionOwnerWhere, resolveIdentityFromRequest } from "@/lib/identity";

type UpdateDecisionPayload = {
  finalChoice?: unknown;
};

function parseStoredArray(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function serializeDecision<T extends { emotions: string | null; aiAnalysis: string | null }>(decision: T) {
  return {
    ...decision,
    emotions: parseStoredArray(decision.emotions),
    aiAnalysis: parseStoredAiAnalysis(decision.aiAnalysis)
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ownerWhere = decisionOwnerWhere(await resolveIdentityFromRequest(request));
    const decision = await db.decision.findFirst({
      where: {
        id,
        ...ownerWhere
      },
      include: {
        options: true,
        review: true
      }
    });

    if (!decision) {
      return NextResponse.json({ error: "决策不存在。" }, { status: 404 });
    }

    return NextResponse.json({ decision: serializeDecision(decision) });
  } catch (error) {
    console.error("Failed to get decision", error);
    return NextResponse.json({ error: "获取决策失败，请稍后再试。" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as UpdateDecisionPayload;
    const ownerWhere = decisionOwnerWhere(await resolveIdentityFromRequest(request));

    if (typeof payload.finalChoice !== "string" || payload.finalChoice.trim().length === 0) {
      return NextResponse.json({ error: "请填写最终选择。" }, { status: 400 });
    }

    const existing = await db.decision.findFirst({
      where: {
        id,
        ...ownerWhere
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return NextResponse.json({ error: "决策不存在。" }, { status: 404 });
    }

    const decision = await db.decision.update({
      where: {
        id: existing.id
      },
      data: {
        finalChoice: payload.finalChoice.trim(),
        status: "DECIDED"
      },
      select: {
        id: true,
        finalChoice: true,
        status: true
      }
    });

    return NextResponse.json({ decision });
  } catch (error) {
    console.error("Failed to update decision", error);
    return NextResponse.json({ error: "保存最终选择失败，请稍后再试。" }, { status: 500 });
  }
}
