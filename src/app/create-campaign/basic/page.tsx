"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCampaignStore } from "@/stores/campaignStore";

const FIELD_CLASS =
  "mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export default function BasicInformationPage() {
  const router = useRouter();
  const creationData = useCampaignStore((state) => state.creationData);
  const updateCreationData = useCampaignStore(
    (state) => state.updateCreationData,
  );
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreationStep(2);
    router.push("/create-campaign/story");
  };

  return (
    <form
      onSubmit={handleNext}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
    >
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Start with the essentials
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Tell donors who is creating this campaign and how it should be
          categorized.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Campaign title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={100}
              autoComplete="off"
              value={creationData.title ?? ""}
              onChange={(event) =>
                updateCreationData({ title: event.target.value })
              }
              className={FIELD_CLASS}
              aria-describedby="title-help"
            />
            <p id="title-help" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Use a short, specific title that explains the goal.
            </p>
          </div>

          <div>
            <label
              htmlFor="creatorName"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Creator name
            </label>
            <input
              id="creatorName"
              name="creatorName"
              type="text"
              required
              autoComplete="name"
              value={creationData.creatorName ?? ""}
              onChange={(event) =>
                updateCreationData({ creatorName: event.target.value })
              }
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={creationData.category ?? "general"}
              onChange={(event) =>
                updateCreationData({ category: event.target.value })
              }
              className={FIELD_CLASS}
            >
              <option value="general">General</option>
              <option value="education">Education</option>
              <option value="environment">Environment</option>
              <option value="technology">Technology</option>
              <option value="community">Community</option>
              <option value="arts">Arts &amp; Culture</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end border-t border-slate-200 pt-6 dark:border-slate-800">
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Next: Story
        </button>
      </div>
    </form>
  );
}
