import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnalyzeDecisionButtonProps = {
  decisionId: string;
};

export function AnalyzeDecisionButton({ decisionId }: AnalyzeDecisionButtonProps) {
  return (
    <Link className={cn(buttonVariants(), "w-full")} href={`/decisions/${decisionId}/analyzing`}>
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      生成低后悔建议
    </Link>
  );
}
