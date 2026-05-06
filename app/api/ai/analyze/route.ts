import { NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek";
import { db } from "@/lib/db";
import { parseAiAnalysis } from "@/lib/ai-analysis";
import { buildDecisionAnalysisMessages } from "@/lib/prompts";

type AnalyzePayload = {
  decisionId?: unknown;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzePayload;

    if (typeof payload.decisionId !== "string" || payload.decisionId.trim().length === 0) {
      return NextResponse.json({ error: "decisionId is required." }, { status: 400 });
    }

    const decision = await db.decision.findUnique({
      where: {
        id: payload.decisionId
      },
      include: {
        options: true
      }
    });

    if (!decision) {
      return NextResponse.json({ error: "Decision not found." }, { status: 404 });
    }

    const userProfile = await db.userProfile.findFirst({
      select: {
        summary: true,
        commonCategories: true,
        commonConcerns: true,
        commonEmotions: true,
        commonBiases: true,
        lowRegretStrategies: true,
        highRegretPatterns: true,
        lowRegretPatterns: true
      }
    });

    const messages = buildDecisionAnalysisMessages(decision, userProfile);
    const rawAnalysis = await callDeepSeek(messages);
    const aiAnalysis = parseAiAnalysis(rawAnalysis);

    await db.decision.update({
      where: {
        id: decision.id
      },
      data: {
        aiAnalysis: JSON.stringify(aiAnalysis),
        status: "ANALYZED"
      }
    });

    return NextResponse.json({ aiAnalysis });
  } catch (error) {
    console.error("Failed to analyze decision", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to analyze decision."
      },
      { status: 500 }
    );
  }
}
