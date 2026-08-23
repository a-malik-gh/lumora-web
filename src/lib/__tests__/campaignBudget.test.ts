import { describe, expect, it } from "vitest";
import {
  canAddMilestoneAmount,
  getMilestoneBudget,
  getMilestoneTotal,
} from "@/lib/campaignBudget";

const milestones = [
  { title: "First", description: "", amount: 300, dueDate: "" },
  { title: "Second", description: "", amount: 250, dueDate: "" },
];

describe("campaign milestone budget", () => {
  it("calculates the allocated and remaining funding goal", () => {
    expect(getMilestoneTotal(milestones)).toBe(550);
    expect(getMilestoneBudget(1000, milestones)).toEqual({
      fundingGoal: 1000,
      allocated: 550,
      remaining: 450,
      isOverBudget: false,
    });
  });

  it("rejects a milestone amount above the remaining funding goal", () => {
    expect(canAddMilestoneAmount(1000, milestones, 450)).toBe(true);
    expect(canAddMilestoneAmount(1000, milestones, 450.01)).toBe(false);
  });

  it("reports persisted milestones that already exceed the goal", () => {
    expect(getMilestoneBudget(500, milestones).isOverBudget).toBe(true);
  });
});
