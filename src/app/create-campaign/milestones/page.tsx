"use client";

import { useRouter } from "next/navigation";
import { CurrencyInputField } from "@/components/campaign-creation/CurrencyInputField";
import { DatePickerField } from "@/components/campaign-creation/DatePickerField";
import {
  canAddMilestoneAmount,
  getMilestoneBudget,
} from "@/lib/campaignBudget";
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
  const milestones = creationData.milestones ?? [];
  const draft = creationData.milestoneDraft ?? EMPTY_MILESTONE;
  const fundingGoal = creationData.goalAmount ?? 0;
  const budget = getMilestoneBudget(fundingGoal, milestones);
  const amountExceedsBudget = draft.amount > budget.remaining;
  const canAddMilestone =
    Boolean(draft.title.trim()) &&
    canAddMilestoneAmount(fundingGoal, milestones, draft.amount);

  const updateDraft = (patch: Partial<MilestoneDraft>) => {
    updateCreationData({ milestoneDraft: { ...draft, ...patch } });
  };

  const addMilestone = () => {
    if (!canAddMilestone) return;

    updateCreationData({
      milestones: [...milestones, { ...draft, title: draft.title.trim() }],
      milestoneDraft: { ...EMPTY_MILESTONE },
    });
  };

  const removeMilestone = (index: number) => {
    updateCreationData({
      milestones: milestones.filter((_, milestoneIndex) => milestoneIndex !== index),
    });
  };

  const handleBack = () => {
    setCreationStep(2);
    router.push("/create-campaign/story");
  };

  const handleNext = () => {
    if (budget.isOverBudget) return;
    setCreationStep(4);
    router.push("/create-campaign/assets");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Break the work into milestones
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Milestones are optional. Add measurable outcomes so donors can follow
          progress.
        </p>

        <dl className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Milestone budget">
          <BudgetValue label="Funding goal" value={budget.fundingGoal} />
          <BudgetValue label="Allocated" value={budget.allocated} />
          <BudgetValue label="Remaining" value={budget.remaining} highlight />
        </dl>

        {budget.isOverBudget && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
          >
            Milestones exceed the funding goal by ${(
              budget.allocated - budget.fundingGoal
            ).toLocaleString()}. Remove a milestone or increase the funding
            goal before continuing.
          </div>
        )}

        {milestones.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Added milestones
            </h3>
            <ul className="mt-3 space-y-3">
              {milestones.map((milestone, index) => (
                <li
                  key={`${milestone.title}-${index}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {milestone.title}
                    </p>
                    {milestone.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {milestone.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {(creationData.currency ?? "$") + milestone.amount.toLocaleString()}
                      {milestone.dueDate ? ` · Due ${milestone.dueDate}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-300 dark:hover:bg-red-950"
                    aria-label={`Remove ${milestone.title}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 rounded-xl bg-slate-50 p-5 dark:bg-slate-950">
          <h3 className="font-semibold text-slate-950 dark:text-white">
            Add a milestone
          </h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="milestoneTitle" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Title
              </label>
              <input
                id="milestoneTitle"
                type="text"
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                className={FIELD_CLASS}
              />
            </div>
            <CurrencyInputField
              id="milestoneAmount"
              label="Milestone goal"
              min={0.01}
              max={budget.remaining}
              value={draft.amount || ""}
              onChange={(amount) => updateDraft({ amount })}
              helperText={`Up to $${budget.remaining.toLocaleString()} remains available.`}
              error={
                fundingGoal <= 0 && draft.amount > 0
                  ? "Set a funding goal in the Story step before allocating milestones."
                  : amountExceedsBudget
                    ? `Milestone goal cannot exceed the remaining $${budget.remaining.toLocaleString()}.`
                    : undefined
              }
            />
            <div className="sm:col-span-2">
              <label htmlFor="milestoneDescription" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Description <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <textarea
                id="milestoneDescription"
                rows={3}
                value={draft.description}
                onChange={(event) => updateDraft({ description: event.target.value })}
                className={FIELD_CLASS}
              />
            </div>
            <DatePickerField
              id="milestoneDueDate"
              label="Due date"
              optional
              max={creationData.endDate || undefined}
              value={draft.dueDate}
              onChange={(dueDate) => updateDraft({ dueDate })}
              helperText={
                creationData.endDate
                  ? `Choose a date on or before ${creationData.endDate}.`
                  : "Choose the expected completion date."
              }
            />
          </div>
          <button
            type="button"
            onClick={addMilestone}
            disabled={!canAddMilestone}
            className="mt-5 min-h-11 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Add milestone
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-between">
        <button type="button" onClick={handleBack} className="min-h-11 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
          Back: Story
        </button>
        <button type="button" onClick={handleNext} disabled={budget.isOverBudget} className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          Next: Assets
        </button>
      </div>
    </section>
  );
}

function BudgetValue({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
        ${value.toLocaleString()}
      </dd>
    </div>
  );
}
