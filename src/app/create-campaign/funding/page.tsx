"use client";

import { useRouter } from "next/navigation";
import { CurrencyInputField } from "@/components/campaign-creation/CurrencyInputField";
import {
  ACCEPTED_ASSETS,
  CAMPAIGN_NETWORKS,
  DURATION_PRESETS,
  MAX_CUSTOM_DURATION_DAYS,
  MIN_CUSTOM_DURATION_DAYS,
  computeEndDate,
  getDurationDays,
  getFundingConfigErrors,
  type AcceptedAsset,
  type CampaignNetwork,
  type DurationPreset,
} from "@/lib/fundingConfig";
import { useCampaignStore } from "@/stores/campaignStore";

const ASSET_DESCRIPTIONS: Record<AcceptedAsset, string> = {
  XLM: "Stellar Lumens, the network's native asset",
  USDC: "US dollar stablecoin issued on Stellar",
  AQUA: "AQUA, the Aquarius protocol token",
};

const NETWORK_COPY: Record<
  CampaignNetwork,
  { label: string; description: string }
> = {
  testnet: {
    label: "Testnet",
    description: "Deploy with test funds. Best for trying the flow out.",
  },
  mainnet: {
    label: "Mainnet",
    description: "Deploy live. Donations use real assets.",
  },
};

export default function CampaignFundingPage() {
  const router = useRouter();
  const creationData = useCampaignStore((state) => state.creationData);
  const updateCreationData = useCampaignStore(
    (state) => state.updateCreationData,
  );
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);

  const goalAmount = creationData.goalAmount ?? 0;
  const acceptedAssets = creationData.acceptedAssets ?? [];
  const durationPreset = creationData.durationPreset ?? 30;
  const customDurationDays = creationData.customDurationDays ?? 30;
  const minimumDonation = creationData.minimumDonation ?? 0;
  const network = creationData.network ?? "testnet";

  const errors = getFundingConfigErrors({
    goalAmount,
    acceptedAssets,
    durationPreset,
    customDurationDays,
    minimumDonation,
  });
  const durationDays = getDurationDays(durationPreset, customDurationDays);
  const endDate = errors.duration ? "" : computeEndDate(durationDays);
  const isValid = Object.keys(errors).length === 0;

  const toggleAsset = (asset: AcceptedAsset) => {
    updateCreationData({
      acceptedAssets: acceptedAssets.includes(asset)
        ? acceptedAssets.filter((value) => value !== asset)
        : ACCEPTED_ASSETS.filter(
            (value) => acceptedAssets.includes(value) || value === asset,
          ),
    });
  };

  const setDuration = (preset: DurationPreset, customDays?: number) => {
    const nextCustomDays = customDays ?? customDurationDays;
    const days = getDurationDays(preset, nextCustomDays);
    updateCreationData({
      durationPreset: preset,
      customDurationDays: nextCustomDays,
      endDate:
        days >= MIN_CUSTOM_DURATION_DAYS && days <= MAX_CUSTOM_DURATION_DAYS
          ? computeEndDate(days)
          : "",
    });
  };

  const handleBack = () => {
    setCreationStep(2);
    router.push("/create-campaign/story");
  };

  const handleNext = () => {
    if (!isValid) return;
    updateCreationData({ endDate: computeEndDate(durationDays) });
    setCreationStep(4);
    router.push("/create-campaign/milestones");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Configure funding
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Set your goal, which assets donors can contribute, how long the
          campaign runs, and which Stellar network it deploys to.
        </p>

        <div className="mt-8 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <CurrencyInputField
              id="goalAmount"
              label="Funding goal"
              required
              min={0.01}
              value={goalAmount || ""}
              onChange={(value) => updateCreationData({ goalAmount: value })}
              helperText="The total amount this campaign needs to raise."
              error={goalAmount === 0 ? undefined : errors.goalAmount}
            />
            <CurrencyInputField
              id="minimumDonation"
              label="Minimum donation"
              min={0}
              value={minimumDonation || ""}
              onChange={(value) =>
                updateCreationData({ minimumDonation: value })
              }
              helperText="Donations below this amount are rejected. Leave empty for no minimum."
              error={errors.minimumDonation}
            />
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Accepted assets
            </legend>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select every asset donors can contribute with.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {ACCEPTED_ASSETS.map((asset) => {
                const isSelected = acceptedAssets.includes(asset);
                return (
                  <label
                    key={asset}
                    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAsset(asset)}
                      className="mt-0.5 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      <span className="block font-semibold text-slate-950 dark:text-white">
                        {asset}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {ASSET_DESCRIPTIONS[asset]}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.acceptedAssets && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-700 dark:text-red-300"
              >
                {errors.acceptedAssets}
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Campaign duration
            </legend>
            <div
              className="mt-3 flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Campaign duration"
            >
              {[...DURATION_PRESETS, "custom" as const].map((preset) => {
                const isSelected = durationPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setDuration(preset)}
                    className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    {preset === "custom" ? "Custom" : `${preset} days`}
                  </button>
                );
              })}
            </div>
            {durationPreset === "custom" && (
              <div className="mt-4 max-w-xs">
                <label
                  htmlFor="customDurationDays"
                  className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Custom duration (days)
                </label>
                <input
                  id="customDurationDays"
                  type="number"
                  inputMode="numeric"
                  min={MIN_CUSTOM_DURATION_DAYS}
                  max={MAX_CUSTOM_DURATION_DAYS}
                  step={1}
                  value={customDurationDays || ""}
                  onChange={(event) =>
                    setDuration("custom", Number(event.target.value))
                  }
                  aria-invalid={Boolean(errors.duration)}
                  className={`mt-2 block min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-slate-950 shadow-sm outline-none focus:ring-2 dark:bg-slate-950 dark:text-white ${
                    errors.duration
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-slate-700"
                  }`}
                />
              </div>
            )}
            <p
              role={errors.duration ? "alert" : undefined}
              className={`mt-2 text-sm ${
                errors.duration
                  ? "font-medium text-red-700 dark:text-red-300"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {errors.duration ??
                `The campaign runs ${durationDays} days and ends on ${endDate}.`}
            </p>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Network
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CAMPAIGN_NETWORKS.map((value) => {
                const isSelected = network === value;
                return (
                  <label
                    key={value}
                    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950"
                    }`}
                  >
                    <input
                      type="radio"
                      name="network"
                      value={value}
                      checked={isSelected}
                      onChange={() => updateCreationData({ network: value })}
                      className="mt-0.5 h-5 w-5 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      <span className="block font-semibold text-slate-950 dark:text-white">
                        {NETWORK_COPY[value].label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {NETWORK_COPY[value].description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Back: Story
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid}
          className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next: Milestones
        </button>
      </div>
    </section>
  );
}
