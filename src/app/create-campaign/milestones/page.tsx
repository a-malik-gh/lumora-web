"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
import { CurrencyInputField } from "@/components/campaign-creation/CurrencyInputField";
import { DatePickerField } from "@/components/campaign-creation/DatePickerField";
import {
  MAX_MILESTONES,
  moveMilestone,
  validateMilestones,
} from "@/lib/milestones";
import { useCampaignStore, type MilestoneDraft } from "@/stores/campaignStore";

const EMPTY_MILESTONE: MilestoneDraft = {
  title: "",
  description: "",
  amount: 0,
  dueDate: "",
};

const FIELD_CLASS =
  "mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export default function MilestonesPage() {
  const router = useRouter();
  const creationData = useCampaignStore((state) => state.creationData);
  const updateCreationData = useCampaignStore(
    (state) => state.updateCreationData,
  );
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const milestones = creationData.milestones ?? [];
  const fundingGoal = creationData.goalAmount ?? 0;
  const validation = validateMilestones(fundingGoal, milestones);
  const canContinue = milestones.length === 0 || validation.isValid;

  const setMilestones = (next: MilestoneDraft[]) => {
    updateCreationData({ milestones: next });
  };

  const updateMilestone = (index: number, patch: Partial<MilestoneDraft>) => {
    setMilestones(
      milestones.map((milestone, milestoneIndex) =>
        milestoneIndex === index ? { ...milestone, ...patch } : milestone,
      ),
    );
  };

  const addMilestone = () => {
    if (milestones.length >= MAX_MILESTONES) return;
    setMilestones([...milestones, { ...EMPTY_MILESTONE }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(
      milestones.filter((_, milestoneIndex) => milestoneIndex !== index),
    );
  };

  const reorder = (fromIndex: number, toIndex: number) => {
    setMilestones(moveMilestone(milestones, fromIndex, toIndex));
  };

  const handleDrop = (event: DragEvent, toIndex: number) => {
    event.preventDefault();
    if (dragIndex !== null) reorder(dragIndex, toIndex);
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleBack = () => {
    setCreationStep(3);
    router.push("/create-campaign/funding");
  };

  const handleNext = () => {
    if (!canContinue) return;
    setCreationStep(5);
    router.push("/create-campaign/assets");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Break the work into milestones
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Milestones are cumulative funding targets: each target must be higher
          than the one before it, and the final milestone must equal your
          {" "}
          <span className="font-semibold text-slate-950 dark:text-white">
            ${fundingGoal.toLocaleString()}
          </span>{" "}
          funding goal. Add up to {MAX_MILESTONES}, and drag to reorder.
        </p>

        {fundingGoal <= 0 && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
          >
            Set a funding goal in the Funding step before adding milestones.
          </div>
        )}

        <ol className="mt-8 space-y-4" aria-label="Milestones">
          {milestones.map((milestone, index) => {
            const error = validation.errors[index];
            return (
              <li
                key={index}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropIndex(index);
                }}
                onDragLeave={() =>
                  setDropIndex((current) =>
                    current === index ? null : current,
                  )
                }
                onDrop={(event) => handleDrop(event, index)}
                className={`rounded-xl border bg-slate-50 p-5 transition-colors dark:bg-slate-950 ${
                  error
                    ? "border-red-400 dark:border-red-700"
                    : dropIndex === index && dragIndex !== null
                      ? "border-indigo-500"
                      : "border-slate-200 dark:border-slate-700"
                } ${dragIndex === index ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        setDragIndex(index);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setDropIndex(null);
                      }}
                      title="Drag to reorder"
                      aria-hidden="true"
                      className="cursor-grab select-none rounded-md px-2 py-1 text-lg leading-none text-slate-400 hover:bg-slate-200 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-800"
                    >
                      ⠿
                    </span>
                    <h3 className="font-semibold text-slate-950 dark:text-white">
                      Milestone {index + 1}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => reorder(index, index - 1)}
                      disabled={index === 0}
                      aria-label={`Move milestone ${index + 1} up`}
                      className="min-h-11 min-w-11 rounded-lg text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => reorder(index, index + 1)}
                      disabled={index === milestones.length - 1}
                      aria-label={`Move milestone ${index + 1} down`}
                      className="min-h-11 min-w-11 rounded-lg text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      aria-label={`Remove milestone ${index + 1}`}
                      className="min-h-11 rounded-lg px-3 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`milestone-${index}-title`}
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Title
                    </label>
                    <input
                      id={`milestone-${index}-title`}
                      type="text"
                      value={milestone.title}
                      onChange={(event) =>
                        updateMilestone(index, { title: event.target.value })
                      }
                      className={FIELD_CLASS}
                    />
                  </div>
                  <CurrencyInputField
                    id={`milestone-${index}-amount`}
                    label="Target amount"
                    min={0.01}
                    max={fundingGoal || undefined}
                    value={milestone.amount || ""}
                    onChange={(amount) => updateMilestone(index, { amount })}
                  />
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`milestone-${index}-description`}
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Description{" "}
                      <span className="font-normal text-slate-500">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id={`milestone-${index}-description`}
                      rows={2}
                      value={milestone.description}
                      onChange={(event) =>
                        updateMilestone(index, {
                          description: event.target.value,
                        })
                      }
                      className={FIELD_CLASS}
                    />
                  </div>
                  <DatePickerField
                    id={`milestone-${index}-dueDate`}
                    label="Expected completion date"
                    max={creationData.endDate || undefined}
                    value={milestone.dueDate}
                    onChange={(dueDate) => updateMilestone(index, { dueDate })}
                    helperText={
                      creationData.endDate
                        ? `On or before the campaign end date, ${creationData.endDate}.`
                        : undefined
                    }
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                  >
                    {error}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          onClick={addMilestone}
          disabled={milestones.length >= MAX_MILESTONES}
          className="mt-6 min-h-11 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Add milestone
        </button>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {milestones.length >= MAX_MILESTONES
            ? `You have reached the maximum of ${MAX_MILESTONES} milestones.`
            : `${milestones.length} of ${MAX_MILESTONES} milestones added. Milestones are optional.`}
        </p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="min-h-11 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Back: Funding
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next: Assets
        </button>
      </div>
    </section>
  );
}
