import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_CREATION_STEPS,
  getCampaignCreationPath,
  getCampaignCreationStep,
} from "@/lib/campaignCreation";

describe("campaign creation steps", () => {
  it("defines the seven-step guided flow in order", () => {
    expect(CAMPAIGN_CREATION_STEPS.map((step) => step.name)).toEqual([
      "Basics",
      "Story",
      "Funding",
      "Milestones",
      "Assets",
      "Review",
      "Deploy",
    ]);
  });

  it("maps routes and falls back to the first step", () => {
    expect(getCampaignCreationStep("/create-campaign/funding")?.id).toBe(3);
    expect(getCampaignCreationStep("/create-campaign/assets")?.id).toBe(5);
    expect(getCampaignCreationPath(7)).toBe("/create-campaign/deploy");
    expect(getCampaignCreationPath(99)).toBe("/create-campaign/basic");
  });
});
