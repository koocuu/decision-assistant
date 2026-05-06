import { DecisionIntake } from "@/components/decision-intake";
import { PageHeader } from "@/components/page-header";

export default function NewDecisionPage() {
  return (
    <div>
      <PageHeader
        title="把你现在纠结的事直接写下来"
        description="不用整理语言，我会帮你拆成选项、情绪和一个低后悔行动。"
      />
      <DecisionIntake />
    </div>
  );
}
