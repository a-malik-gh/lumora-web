export const ACCEPTED_ASSETS = ["XLM", "USDC", "AQUA"] as const;
export type AcceptedAsset = (typeof ACCEPTED_ASSETS)[number];

export const DURATION_PRESETS = [7, 14, 30, 60, 90] as const;
export type DurationPreset = (typeof DURATION_PRESETS)[number] | "custom";

export const CAMPAIGN_NETWORKS = ["testnet", "mainnet"] as const;
export type CampaignNetwork = (typeof CAMPAIGN_NETWORKS)[number];

export const MIN_CUSTOM_DURATION_DAYS = 1;
export const MAX_CUSTOM_DURATION_DAYS = 365;

export function getDurationDays(
  preset: DurationPreset,
  customDays: number,
): number {
  if (preset === "custom") return Math.floor(customDays || 0);
  return preset;
}

export function isValidDurationDays(days: number) {
  return (
    Number.isInteger(days) &&
    days >= MIN_CUSTOM_DURATION_DAYS &&
    days <= MAX_CUSTOM_DURATION_DAYS
  );
}

export function computeEndDate(days: number, from: Date = new Date()): string {
  const end = new Date(from);
  end.setDate(end.getDate() + days);

  const year = end.getFullYear();
  const month = String(end.getMonth() + 1).padStart(2, "0");
  const day = String(end.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface FundingConfigInput {
  goalAmount: number;
  acceptedAssets: AcceptedAsset[];
  durationPreset: DurationPreset;
  customDurationDays: number;
  minimumDonation: number;
}

export interface FundingConfigErrors {
  goalAmount?: string;
  acceptedAssets?: string;
  duration?: string;
  minimumDonation?: string;
}

export function getFundingConfigErrors(
  input: FundingConfigInput,
): FundingConfigErrors {
  const errors: FundingConfigErrors = {};
  const days = getDurationDays(input.durationPreset, input.customDurationDays);

  if (!(input.goalAmount > 0)) {
    errors.goalAmount = "Set a funding goal greater than zero.";
  }
  if (input.acceptedAssets.length === 0) {
    errors.acceptedAssets = "Select at least one asset donors can contribute.";
  }
  if (!isValidDurationDays(days)) {
    errors.duration = `Duration must be between ${MIN_CUSTOM_DURATION_DAYS} and ${MAX_CUSTOM_DURATION_DAYS} days.`;
  }
  if (input.minimumDonation < 0) {
    errors.minimumDonation = "Minimum donation cannot be negative.";
  } else if (
    input.goalAmount > 0 &&
    input.minimumDonation > input.goalAmount
  ) {
    errors.minimumDonation =
      "Minimum donation cannot exceed the funding goal.";
  }

  return errors;
}

export function isFundingConfigValid(input: FundingConfigInput) {
  return Object.keys(getFundingConfigErrors(input)).length === 0;
}
