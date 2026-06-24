import { notFound, redirect } from "next/navigation";
import { AnalyzeDecisionRunner } from "@/components/analyze-decision-runner";
import { db } from "@/lib/db";
import { decisionOwnerWhere, resolveIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";

export default async function AnalyzingDecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await db.decision.findFirst({
    where: {
      id,
      ...decisionOwnerWhere(await resolveIdentity())
    },
    select: {
      id: true,
      aiAnalysis: true
    }
  });

  if (!decision) {
    notFound();
  }

  if (decision.aiAnalysis) {
    redirect(`/decisions/${decision.id}`);
  }

  return <AnalyzeDecisionRunner decisionId={decision.id} />;
}
