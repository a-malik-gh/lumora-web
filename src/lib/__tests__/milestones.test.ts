import { describe, expect, it } from "vitest";
import {
  MAX_MILESTONES,
  moveMilestone,
  validateMilestones,
} from "@/lib/milestones";
import type { MilestoneDraft } from "@/stores/campaignStore";

function milestone(overrides: Partial<MilestoneDraft>): MilestoneDraft {
  return {
    title: "Milestone",
    description: "",
    amount: 0,
    dueDate: "2026-10-01",
    ...overrides,
  };
}

describe("validateMilestones", () => {
  it("accepts ascending targets where the final milestone equals the goal", () => {
    const result = validateMilestones(1000, [
      milestone({ title: "Kickoff", amount: 300 }),
      milestone({ title: "Build", amount: 700 }),
      milestone({ title: "Launch", amount: 1000 }),
    ]);

    expect(result.errors).toEqual([null, null, null]);
    expect(result.isValid).toBe(true);
  });

  it("accepts an empty milestone list", () => {
    expect(validateMilestones(1000, []).isValid).toBe(true);
  });

  it("rejects targets that do not ascend", () => {
    const result = validateMilestones(1000, [
      milestone({ amount: 500 }),
      milestone({ amount: 500 }),
      milestone({ amount: 1000 }),
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors[1]).toContain("ascend");
    expect(result.errors[2]).toBeNull();
  });

  it("rejects a final milestone that does not equal the goal", () => {
    const belowGoal = validateMilestones(1000, [
      milestone({ amount: 400 }),
      milestone({ amount: 900 }),
    ]);
    expect(belowGoal.isValid).toBe(false);
    expect(belowGoal.errors[1]).toContain("must equal the total funding goal");

    const aboveGoal = validateMilestones(1000, [
      milestone({ amount: 1200 }),
    ]);
    expect(aboveGoal.isValid).toBe(false);
    expect(aboveGoal.errors[0]).toContain("cannot exceed the funding goal");
  });

  it("requires a title, a positive target, and a completion date", () => {
    const result = validateMilestones(1000, [
      milestone({ title: "  ", amount: 1000 }),
      milestone({ amount: 0 }),
      milestone({ amount: 1000, dueDate: "" }),
    ]);

    expect(result.errors[0]).toContain("title");
    expect(result.errors[1]).toContain("greater than zero");
    expect(result.errors[2]).toContain("completion date");
  });

  it("rejects more than the maximum number of milestones", () => {
    const tooMany = Array.from({ length: MAX_MILESTONES + 1 }, (_, index) =>
      milestone({ amount: ((index + 1) * 1000) / (MAX_MILESTONES + 1) }),
    );

    expect(validateMilestones(1000, tooMany).isValid).toBe(false);
  });
});

describe("moveMilestone", () => {
  const milestones = [
    milestone({ title: "A", amount: 100 }),
    milestone({ title: "B", amount: 200 }),
    milestone({ title: "C", amount: 300 }),
  ];

  it("moves a milestone to a new position", () => {
    expect(moveMilestone(milestones, 0, 2).map((m) => m.title)).toEqual([
      "B",
      "C",
      "A",
    ]);
    expect(moveMilestone(milestones, 2, 0).map((m) => m.title)).toEqual([
      "C",
      "A",
      "B",
    ]);
  });

  it("returns the same list for out-of-range or no-op moves", () => {
    expect(moveMilestone(milestones, 1, 1)).toBe(milestones);
    expect(moveMilestone(milestones, -1, 0)).toBe(milestones);
    expect(moveMilestone(milestones, 0, 3)).toBe(milestones);
  });
});
