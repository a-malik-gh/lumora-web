import type { MilestoneDraft } from "@/stores/campaignStore";

export const MAX_MILESTONES = 5;

export interface MilestoneValidation {
  /** One entry per milestone; null when that milestone is valid. */
  errors: (string | null)[];
  isValid: boolean;
}

function formatAmount(value: number) {
  return `$${value.toLocaleString()}`;
}

/**
 * Milestone amounts are cumulative funding targets: each milestone must be
 * strictly greater than the previous one, and the final milestone must equal
 * the total funding goal.
 */
export function validateMilestones(
  fundingGoal: number,
  milestones: MilestoneDraft[] = [],
): MilestoneValidation {
  const goal = Math.max(0, fundingGoal || 0);

  const errors = milestones.map((milestone, index) => {
    if (!milestone.title.trim()) {
      return "Give this milestone a title.";
    }
    if (!(milestone.amount > 0)) {
      return "Set a target amount greater than zero.";
    }
    if (index > 0 && milestone.amount <= milestones[index - 1].amount) {
      return `Target must be greater than the previous milestone's ${formatAmount(
        milestones[index - 1].amount,
      )} — targets must ascend toward the goal.`;
    }
    if (milestone.amount > goal) {
      return `Target cannot exceed the funding goal of ${formatAmount(goal)}.`;
    }
    if (!milestone.dueDate) {
      return "Set the expected completion date.";
    }
    if (index === milestones.length - 1 && milestone.amount !== goal) {
      return `The final milestone must equal the total funding goal of ${formatAmount(
        goal,
      )}.`;
    }
    return null;
  });

  return {
    errors,
    isValid:
      milestones.length <= MAX_MILESTONES &&
      errors.every((error) => error === null),
  };
}

export function areMilestonesValid(
  fundingGoal: number,
  milestones: MilestoneDraft[] = [],
) {
  return validateMilestones(fundingGoal, milestones).isValid;
}

export function moveMilestone(
  milestones: MilestoneDraft[],
  fromIndex: number,
  toIndex: number,
): MilestoneDraft[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= milestones.length ||
    toIndex >= milestones.length
  ) {
    return milestones;
  }

  const reordered = [...milestones];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered;
}
