import type { MilestoneDraft } from "@/stores/campaignStore";

export function getMilestoneTotal(milestones: MilestoneDraft[] = []) {
  return milestones.reduce(
    (total, milestone) => total + Math.max(0, milestone.amount || 0),
    0,
  );
}

export function getMilestoneBudget(
  fundingGoal: number,
  milestones: MilestoneDraft[] = [],
) {
  const normalizedGoal = Math.max(0, fundingGoal || 0);
  const allocated = getMilestoneTotal(milestones);

  return {
    fundingGoal: normalizedGoal,
    allocated,
    remaining: Math.max(0, normalizedGoal - allocated),
    isOverBudget: allocated > normalizedGoal,
  };
}

export function canAddMilestoneAmount(
  fundingGoal: number,
  milestones: MilestoneDraft[],
  amount: number,
) {
  if (amount <= 0) return false;
  return amount <= getMilestoneBudget(fundingGoal, milestones).remaining;
}
