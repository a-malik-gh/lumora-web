"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCampaignStore } from "@/stores/campaignStore";

const FIELD_CLASS =
  "mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export default function CampaignStoryPage() {
  const router = useRouter();
  const creationData = useCampaignStore((state) => state.creationData);
  const updateCreationData = useCampaignStore(
    (state) => state.updateCreationData,
  );
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreationStep(3);
    router.push("/create-campaign/milestones");
  };

  const handleBack = () => {
    setCreationStep(1);
    router.push("/create-campaign/basic");
  };

  return (
    <form
      onSubmit={handleNext}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
    >
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Tell your campaign story
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Explain the need, the outcome, and how the funds will be used.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="description"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Campaign story
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={40}
              rows={8}
              value={creationData.description ?? ""}
              onChange={(event) =>
                updateCreationData({ description: event.target.value })
              }
              className={FIELD_CLASS}
              aria-describedby="description-help"
            />
            <p id="description-help" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Include enough context for donors to understand the impact.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="goalAmount"
                className="text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Funding goal
              </label>
              <input
                id="goalAmount"
                name="goalAmount"
                type="number"
                required
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={creationData.goalAmount || ""}
                onChange={(event) =>
                  updateCreationData({ goalAmount: Number(event.target.value) })
                }
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                End date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                value={creationData.endDate ?? ""}
                onChange={(event) =>
                  updateCreationData({ endDate: event.target.value })
                }
                className={FIELD_CLASS}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Back: Basics
        </button>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Next: Milestones
        </button>
      </div>
    </form>
  );
}
