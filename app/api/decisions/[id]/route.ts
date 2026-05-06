import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type UpdateDecisionPayload = {
  finalChoice?: unknown;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as UpdateDecisionPayload;

    if (typeof payload.finalChoice !== "string" || payload.finalChoice.trim().length === 0) {
      return NextResponse.json({ error: "请填写最终选择。" }, { status: 400 });
    }

    const decision = await db.decision.update({
      where: {
        id
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
