"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDurationDays } from "@/lib/fundingConfig";
import { validateMilestones } from "@/lib/milestones";
import { useCampaignStore } from "@/stores/campaignStore";

export default function CampaignReviewPage() {
  const router = useRouter();
  const creationData = useCampaignStore((state) => state.creationData);
  const updateCreationData = useCampaignStore(
    (state) => state.updateCreationData,
  );
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);
  const currency = creationData.currency ?? "$";
  const milestones = creationData.milestones ?? [];
  const milestoneValidation = validateMilestones(
    creationData.goalAmount ?? 0,
    milestones,
  );
  const durationDays = getDurationDays(
    creationData.durationPreset ?? 30,
    creationData.customDurationDays ?? 30,
  );

  const missingFields = [
    !creationData.title?.trim() && "campaign title",
    !creationData.creatorName?.trim() && "creator name",
    !creationData.description?.trim() && "campaign story",
    !(creationData.goalAmount && creationData.goalAmount > 0) && "funding goal",
    (creationData.acceptedAssets ?? []).length === 0 && "accepted assets",
    !creationData.endDate && "campaign duration",
    milestones.length > 0 &&
      !milestoneValidation.isValid &&
      "valid milestones (ascending targets, final milestone equal to the goal)",
  ].filter(Boolean) as string[];

  const canContinue =
    missingFields.length === 0 && Boolean(creationData.termsAccepted);

  const handleBack = () => {
    setCreationStep(5);
    router.push("/create-campaign/assets");
  };

  const handleNext = () => {
    if (!canContinue) return;
    setCreationStep(7);
    router.push("/create-campaign/deploy");
  };

  return (
    <section className="space-y-6">
      {missingFields.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
        >
          <p className="font-semibold">Complete the required information before deploying.</p>
          <p className="mt-1">Missing: {missingFields.join(", ")}.</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Review your campaign
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Check each section. Your browser will keep this draft until you
            reset it or clear site data.
          </p>
        </div>

        <ReviewSection title="Basics" editPath="/create-campaign/basic">
          <SummaryRow label="Title" value={creationData.title || "Not provided"} />
          <SummaryRow label="Creator" value={creationData.creatorName || "Not provided"} />
          <SummaryRow label="Category" value={creationData.category || "Not provided"} />
        </ReviewSection>

        <ReviewSection title="Story" editPath="/create-campaign/story">
          <SummaryRow label="Story" value={creationData.description || "Not provided"} />
        </ReviewSection>

        <ReviewSection title="Funding" editPath="/create-campaign/funding">
          <SummaryRow
            label="Funding goal"
            value={`${currency}${(creationData.goalAmount ?? 0).toLocaleString()}`}
          />
          <SummaryRow
            label="Accepted assets"
            value={
              (creationData.acceptedAssets ?? []).join(", ") || "None selected"
            }
          />
          <SummaryRow
            label="Duration"
            value={
              creationData.endDate
                ? `${durationDays} days · ends ${creationData.endDate}`
                : "Not provided"
            }
          />
          <SummaryRow
            label="Minimum donation"
            value={
              creationData.minimumDonation
                ? `${currency}${creationData.minimumDonation.toLocaleString()}`
                : "No minimum"
            }
          />
          <SummaryRow
            label="Network"
            value={creationData.network === "mainnet" ? "Mainnet" : "Testnet"}
          />
        </ReviewSection>

        <ReviewSection title="Milestones" editPath="/create-campaign/milestones">
          {milestones.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No milestones added.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {milestones.map((milestone, index) => (
                <li key={`${milestone.title}-${index}`}>
                  <span className="font-semibold">
                    {milestone.title || `Milestone ${index + 1}`}
                  </span>
                  {` · ${currency}${milestone.amount.toLocaleString()}`}
                  {milestone.dueDate ? ` · due ${milestone.dueDate}` : ""}
                  {milestoneValidation.errors[index] && (
                    <span className="ml-2 font-medium text-red-700 dark:text-red-300">
                      {milestoneValidation.errors[index]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ReviewSection>

        <ReviewSection title="Assets" editPath="/create-campaign/assets">
          <SummaryRow label="Cover image" value={creationData.coverImage || "Not provided"} />
          <SummaryRow
            label="Supporting assets"
            value={`${creationData.supportingAssetUrls?.length ?? 0} added`}
          />
        </ReviewSection>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={creationData.termsAccepted ?? false}
            onChange={(event) =>
              updateCreationData({ termsAccepted: event.target.checked })
            }
            className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <label htmlFor="terms" className="font-semibold text-slate-950 dark:text-white">
              I confirm this campaign information is accurate
            </label>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Deployment creates a blockchain transaction. Review wallet and
              network details on the next step before signing.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={handleBack} className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
          Back: Assets
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next: Deploy
        </button>
      </div>
    </section>
  );
}

function ReviewSection({
  title,
  editPath,
  children,
}: {
  title: string;
  editPath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 p-6 last:border-b-0 dark:border-slate-800 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
          <div className="mt-4 space-y-3">{children}</div>
        </div>
        <Link
          href={editPath}
          className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[9rem_1fr] sm:gap-4">
      <span className="font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="break-words text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}
