import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decisionCategories, decisionEmotions } from "@/lib/decision-constants";
import { decisionStatuses } from "@/lib/decision-status";
import { decisionOwnerWhere, ownerData, resolveIdentityFromRequest } from "@/lib/identity";
import type { DecisionStatus } from "@/lib/types";

type DecisionOptionPayload = {
  label?: unknown;
  description?: unknown;
};

type CreateDecisionPayload = {
  title?: unknown;
  category?: unknown;
  background?: unknown;
  concern?: unknown;
  fear?: unknown;
  emotions?: unknown;
  deadline?: unknown;
  options?: unknown;
};

type DecisionWhere = {
  category?: string;
  status?: DecisionStatus;
  userId?: string;
  anonId?: string;
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function cleanOptionalString(value: unknown) {
  return isString(value) && value.trim().length > 0 ? value.trim() : null;
}

function parseDeadline(value: unknown) {
  if (!isString(value) || value.trim().length === 0) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseOptions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((option) => {
      const optionPayload = option as DecisionOptionPayload;

      return {
        label: isString(optionPayload.label) ? optionPayload.label.trim() : "",
        description: cleanOptionalString(optionPayload.description)
      };
    })
    .filter((option) => option.label.length > 0);
}

function parseEmotions(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (emotion): emotion is string =>
      isString(emotion) && (decisionEmotions as readonly string[]).includes(emotion)
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const identity = await resolveIdentityFromRequest(request);
    const where: DecisionWhere = decisionOwnerWhere(identity) as DecisionWhere;

    if (category && (decisionCategories as readonly string[]).includes(category)) {
      where.category = category;
    }

    if (status && (decisionStatuses as readonly string[]).includes(status)) {
      where.status = status as DecisionStatus;
    }

    const decisions = await db.decision.findMany({
      where,
      include: {
        review: {
          select: {
            regretScore: true,
            reviewedAt: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({ decisions });
  } catch (error) {
    console.error("Failed to list decisions", error);
    return NextResponse.json({ error: "获取决策列表失败，请稍后再试。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateDecisionPayload;

    const title = cleanOptionalString(payload.title);
    const category = cleanOptionalString(payload.category);
    const background = cleanOptionalString(payload.background);
    const options = parseOptions(payload.options);
    const emotions = parseEmotions(payload.emotions);

    if (!title) {
      return NextResponse.json({ error: "请填写标题。" }, { status: 400 });
    }

    if (!category || !(decisionCategories as readonly string[]).includes(category)) {
      return NextResponse.json({ error: "请选择有效分类。" }, { status: 400 });
    }

    if (!background) {
      return NextResponse.json({ error: "请填写背景描述。" }, { status: 400 });
    }

    if (options.length < 2) {
      return NextResponse.json({ error: "请至少填写两个选项。" }, { status: 400 });
    }

    const deadline = parseDeadline(payload.deadline);
    const identity = await resolveIdentityFromRequest(request);

    const decision = await db.decision.create({
      data: {
        ...ownerData(identity),
        title,
        category,
        background,
        concern: cleanOptionalString(payload.concern),
        fear: cleanOptionalString(payload.fear),
        emotions: JSON.stringify(emotions),
        deadline,
        options: {
          create: options
        }
      },
      select: {
        id: true
      }
    });

    return NextResponse.json({ id: decision.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create decision", error);
    return NextResponse.json({ error: "创建决策失败，请稍后再试。" }, { status: 500 });
  }
}
