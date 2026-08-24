import { describe, expect, it } from "vitest";
import {
  computeEndDate,
  getDurationDays,
  getFundingConfigErrors,
  isFundingConfigValid,
} from "@/lib/fundingConfig";

const validConfig = {
  goalAmount: 5000,
  acceptedAssets: ["XLM", "USDC"] as ("XLM" | "USDC" | "AQUA")[],
  durationPreset: 30 as const,
  customDurationDays: 30,
  minimumDonation: 10,
};

describe("funding configuration", () => {
  it("resolves preset and custom durations", () => {
    expect(getDurationDays(14, 99)).toBe(14);
    expect(getDurationDays("custom", 45)).toBe(45);
  });

  it("computes the end date from a start date", () => {
    expect(computeEndDate(7, new Date(2026, 7, 24))).toBe("2026-08-31");
    expect(computeEndDate(30, new Date(2026, 11, 15))).toBe("2027-01-14");
  });

  it("accepts a complete configuration", () => {
    expect(isFundingConfigValid(validConfig)).toBe(true);
  });

  it("requires a goal, at least one asset, and a valid duration", () => {
    expect(
      getFundingConfigErrors({ ...validConfig, goalAmount: 0 }).goalAmount,
    ).toBeTruthy();
    expect(
      getFundingConfigErrors({ ...validConfig, acceptedAssets: [] })
        .acceptedAssets,
    ).toBeTruthy();
    expect(
      getFundingConfigErrors({
        ...validConfig,
        durationPreset: "custom",
        customDurationDays: 0,
      }).duration,
    ).toBeTruthy();
    expect(
      getFundingConfigErrors({
        ...validConfig,
        durationPreset: "custom",
        customDurationDays: 366,
      }).duration,
    ).toBeTruthy();
  });

  it("rejects a minimum donation above the goal or below zero", () => {
    expect(
      getFundingConfigErrors({ ...validConfig, minimumDonation: 5001 })
        .minimumDonation,
    ).toBeTruthy();
    expect(
      getFundingConfigErrors({ ...validConfig, minimumDonation: -1 })
        .minimumDonation,
    ).toBeTruthy();
    expect(
      getFundingConfigErrors({ ...validConfig, minimumDonation: 0 })
        .minimumDonation,
    ).toBeUndefined();
  });
});
