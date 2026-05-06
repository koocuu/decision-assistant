import { NextResponse } from "next/server";
import { extractJsonText } from "@/lib/ai-analysis";
import { callDeepSeek } from "@/lib/deepseek";
import { db } from "@/lib/db";
import { buildUserProfileUpdateMessages } from "@/lib/prompts";

type UpdateProfilePayload = {
  decisionId?: unknown;
};

type ProfileUpdate = {
  summary: string;
  commonCategories: string[];
  commonConcerns: string[];
  commonEmotions: string[];
  commonBiases: string[];
  lowRegretStrategies: string[];
  highRegretPatterns: string[];
  lowRegretPatterns: string[];
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseProfileUpdate(content: string): ProfileUpdate {
  const parsed = JSON.parse(extractJsonText(content)) as Record<string, unknown>;

  return {
    summary: asString(parsed.summary),
    commonCategories: stringArray(parsed.commonCategories),
    commonConcerns: stringArray(parsed.commonConcerns),
    commonEmotions: stringArray(parsed.commonEmotions),
    commonBiases: stringArray(parsed.commonBiases),
    lowRegretStrategies: stringArray(parsed.lowRegretStrategies),
    highRegretPatterns: stringArray(parsed.highRegretPatterns),
    lowRegretPatterns: stringArray(parsed.lowRegretPatterns)
  };
}

async function getOrCreateDefaultProfile() {
  const existingProfile = await db.userProfile.findFirst({
    select: {
      id: true,
      summary: true,
      commonCategories: true,
      commonConcerns: true,
      commonEmotions: true,
      commonBiases: true,
      lowRegretStrategies: true,
      highRegretPatterns: true,
      lowRegretPatterns: true,
      updatedAt: true
    }
  });

  if (existingProfile) {
    return existingProfile;
  }

  return db.userProfile.create({
    data: {
      id: "default",
      summary: "",
      commonCategories: JSON.stringify([]),
      commonConcerns: JSON.stringify([]),
      commonEmotions: JSON.stringify([]),
      commonBiases: JSON.stringify([]),
      lowRegretStrategies: JSON.stringify([]),
      highRegretPatterns: JSON.stringify([]),
      lowRegretPatterns: JSON.stringify([])
    },
    select: {
      id: true,
      summary: true,
      commonCategories: true,
      commonConcerns: true,
      commonEmotions: true,
      commonBiases: true,
      lowRegretStrategies: true,
      highRegretPatterns: true,
      lowRegretPatterns: true,
      updatedAt: true
    }
  });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as UpdateProfilePayload;

  if (typeof payload.decisionId !== "string" || payload.decisionId.trim().length === 0) {
    return NextResponse.json({ error: "decisionId is required." }, { status: 400 });
  }

  const decision = await db.decision.findUnique({
    where: {
      id: payload.decisionId
    },
    include: {
      options: true,
      review: true
    }
  });

  if (!decision) {
    return NextResponse.json({ error: "Decision not found." }, { status: 404 });
  }

  if (!decision.review) {
    return NextResponse.json({ error: "Decision review not found." }, { status: 400 });
  }

  const oldProfile = await getOrCreateDefaultProfile();

  try {
    const messages = buildUserProfileUpdateMessages(decision, oldProfile);
    const rawProfileUpdate = await callDeepSeek(messages);
    const profileUpdate = parseProfileUpdate(rawProfileUpdate);

    const profile = await db.userProfile.update({
      where: {
        id: oldProfile.id
      },
      data: {
        summary: profileUpdate.summary,
        commonCategories: JSON.stringify(profileUpdate.commonCategories),
        commonConcerns: JSON.stringify(profileUpdate.commonConcerns),
        commonEmotions: JSON.stringify(profileUpdate.commonEmotions),
        commonBiases: JSON.stringify(profileUpdate.commonBiases),
        lowRegretStrategies: JSON.stringify(profileUpdate.lowRegretStrategies),
        highRegretPatterns: JSON.stringify(profileUpdate.highRegretPatterns),
        lowRegretPatterns: JSON.stringify(profileUpdate.lowRegretPatterns)
      }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to update user profile with AI", error);

    return NextResponse.json({
      profile: oldProfile,
      warning: error instanceof Error ? error.message : "User profile update failed."
    });
  }
}
