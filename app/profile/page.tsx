import { AccountPanel } from "@/components/account-panel";
import { PageHeader } from "@/components/page-header";
import { Sheep } from "@/components/sheep";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileOwnerWhere, resolveIdentity } from "@/lib/identity";
import type { Identity } from "@/lib/identity";

export const dynamic = "force-dynamic";

function parseStringArray(value: string | null) {
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

function hasProfileContent(profile: Awaited<ReturnType<typeof getProfile>>) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.summary?.trim() ||
      parseStringArray(profile.commonCategories).length ||
      parseStringArray(profile.commonConcerns).length ||
      parseStringArray(profile.commonEmotions).length ||
      parseStringArray(profile.commonBiases).length ||
      parseStringArray(profile.lowRegretStrategies).length ||
      parseStringArray(profile.highRegretPatterns).length ||
      parseStringArray(profile.lowRegretPatterns).length
  );
}

async function getProfile(identity: Identity) {
  return db.userProfile.findFirst({
    where: profileOwnerWhere(identity),
    orderBy: {
      updatedAt: "desc"
    }
  });
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无稳定模式。</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-md border bg-accent px-2.5 py-1 text-sm text-accent-foreground">
          {item}
        </span>
      ))}
    </div>
  );
}

function PatternList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无稳定模式。</p>;
  }

  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function ProfilePage() {
  const [identity, user] = await Promise.all([resolveIdentity(), getCurrentUser()]);
  const profile = await getProfile(identity);

  if (!hasProfileContent(profile)) {
    return (
      <div>
        <PageHeader title="我的" description="账号状态和基于复盘逐步更新的决策画像。" />

        <Card className="mb-5 sm:mb-6">
          <CardHeader>
            <CardTitle>账号</CardTitle>
            <CardDescription>匿名也可以完整使用；登录后历史记录会跟随账号。</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountPanel initialUser={publicUser(user)} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div
              className="flex items-center justify-center rounded-3xl"
              style={{ width: 76, height: 76, background: "var(--warm-soft)" }}
            >
              <Sheep size={60} mood="happy" float />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              完成几次决策复盘后，小羊会逐渐总结你的决策模式。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = [
    {
      title: "常见决策类型",
      description: "你经常记录的决策场景。",
      items: parseStringArray(profile?.commonCategories ?? null),
      variant: "tags"
    },
    {
      title: "常见纠结点",
      description: "反复出现的卡点。",
      items: parseStringArray(profile?.commonConcerns ?? null),
      variant: "list"
    },
    {
      title: "常见情绪模式",
      description: "做决定时常见的情绪背景。",
      items: parseStringArray(profile?.commonEmotions ?? null),
      variant: "tags"
    },
    {
      title: "常见认知偏差",
      description: "可能影响判断的思维习惯。",
      items: parseStringArray(profile?.commonBiases ?? null),
      variant: "list"
    },
    {
      title: "适合用户的低后悔策略",
      description: "下次决策前可以复用的方法。",
      items: parseStringArray(profile?.lowRegretStrategies ?? null),
      variant: "list"
    },
    {
      title: "容易后悔的模式",
      description: "复盘中后悔分较高的共性。",
      items: parseStringArray(profile?.highRegretPatterns ?? null),
      variant: "list"
    },
    {
      title: "较少后悔的模式",
      description: "复盘中后悔分较低的共性。",
      items: parseStringArray(profile?.lowRegretPatterns ?? null),
      variant: "list"
    }
  ];

  return (
    <div>
      <PageHeader title="我的" description="账号状态和基于历史决策生成的当前画像。" />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>账号</CardTitle>
            <CardDescription>匿名也可以完整使用；登录后历史记录会跟随账号。</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountPanel initialUser={publicUser(user)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>决策人格摘要</CardTitle>
            <CardDescription>最近更新：{profile ? profile.updatedAt.toLocaleDateString("zh-CN") : "未知"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {profile?.summary || "暂无摘要。"}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {section.variant === "tags" ? (
                  <TagList items={section.items} />
                ) : (
                  <PatternList items={section.items} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
