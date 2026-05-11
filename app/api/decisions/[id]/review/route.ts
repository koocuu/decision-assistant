import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type ReviewPayload = {
  actualResult?: unknown;
  regretScore?: unknown;
  outcome?: unknown;
  fearHappened?: unknown;
  wouldChooseAgain?: unknown;
  lesson?: unknown;
};

const allowedOutcomes = ["better_than_expected", "as_expected", "worse_than_expected"];

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as ReviewPayload;
    const actualResult = optionalString(payload.actualResult);
    const regretScore = typeof payload.regretScore === "number" ? payload.regretScore : Number(payload.regretScore);
    const outcome = optionalString(payload.outcome) ?? "as_expected";
    const fearHappened = typeof payload.fearHappened === "boolean" ? payload.fearHappened : false;
    const wouldChooseAgain =
      typeof payload.wouldChooseAgain === "boolean" ? payload.wouldChooseAgain : regretScore <= 3;

    if (!actualResult) {
      return NextResponse.json({ error: "请填写实际结果。" }, { status: 400 });
    }

    if (!Number.isInteger(regretScore) || regretScore < 1 || regretScore > 5) {
      return NextResponse.json({ error: "后悔程度必须是 1 到 5。" }, { status: 400 });
    }

    if (!allowedOutcomes.includes(outcome)) {
      return NextResponse.json({ error: "请选择有效的结果评价。" }, { status: 400 });
    }

    const decision = await db.decision.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        aiAnalysis: true,
        review: {
          select: {
            id: true
          }
        }
      }
    });

    if (!decision) {
      return NextResponse.json({ error: "决策不存在。" }, { status: 404 });
    }

    if (!decision.aiAnalysis || decision.status === "REVIEWED") {
      return NextResponse.json({ error: "只有已分析且未复盘的决策可以提交复盘。" }, { status: 400 });
    }

    if (decision.review) {
      return NextResponse.json({ error: "该决策已经复盘过。" }, { status: 409 });
    }

    const review = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdReview = await tx.decisionReview.create({
        data: {
          decisionId: id,
          actualResult,
          regretScore,
          outcome,
          fearHappened,
          wouldChooseAgain,
          lesson: optionalString(payload.lesson)
        }
      });

      await tx.decision.update({
        where: { id },
        data: {
          status: "REVIEWED"
        }
      });

      return createdReview;
    });

    let warning: string | undefined;

    try {
      const origin = new URL(request.url).origin;
      const profileResponse = await fetch(`${origin}/api/ai/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ decisionId: id })
      });

      if (!profileResponse.ok) {
        warning = "复盘已保存，但用户画像更新失败。";
        console.error("Failed to update profile after review", await profileResponse.text());
      } else {
        const profileResult = (await profileResponse.json()) as { warning?: string };
        warning = profileResult.warning;
      }
    } catch (profileError) {
      warning = "复盘已保存，但用户画像更新失败。";
      console.error("Failed to call profile update after review", profileError);
    }

    return NextResponse.json({ review, warning }, { status: 201 });
  } catch (error) {
    console.error("Failed to create decision review", error);
    return NextResponse.json({ error: "提交复盘失败，请稍后再试。" }, { status: 500 });
  }
}
