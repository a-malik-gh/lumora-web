"use client";

import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/stores/campaignStore";

const FIELD_CLASS =
  "mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export default function CampaignAssetsPage() {
  const router = useRouter();
  const creationData = useCampaignStore((state) => state.creationData);
  const updateCreationData = useCampaignStore(
    (state) => state.updateCreationData,
  );
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);
  const supportingAssets = creationData.supportingAssetUrls ?? [];
  const assetDraftUrl = creationData.assetDraftUrl ?? "";

  const addSupportingAsset = () => {
    const url = assetDraftUrl.trim();
    if (!url || supportingAssets.includes(url)) return;
    updateCreationData({
      supportingAssetUrls: [...supportingAssets, url],
      assetDraftUrl: "",
    });
  };

  const handleBack = () => {
    setCreationStep(3);
    router.push("/create-campaign/milestones");
  };

  const handleNext = () => {
    setCreationStep(5);
    router.push("/create-campaign/review");
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Add campaign assets
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Add a cover image and optional links to supporting images or videos.
          You can return and change them before deployment.
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <label htmlFor="coverImage" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Cover image URL <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id="coverImage"
              type="url"
              inputMode="url"
              placeholder="https://example.com/campaign-cover.jpg"
              value={creationData.coverImage ?? ""}
              onChange={(event) =>
                updateCreationData({ coverImage: event.target.value })
              }
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="assetUrl" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Supporting asset URL <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="assetUrl"
                type="url"
                inputMode="url"
                placeholder="https://example.com/supporting-asset"
                value={assetDraftUrl}
                onChange={(event) =>
                  updateCreationData({ assetDraftUrl: event.target.value })
                }
                className={`${FIELD_CLASS} mt-0 flex-1`}
              />
              <button
                type="button"
                onClick={addSupportingAsset}
                disabled={!assetDraftUrl.trim()}
                className="min-h-11 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                Add asset
              </button>
            </div>
          </div>

          {supportingAssets.length > 0 && (
            <ul className="space-y-3" aria-label="Supporting assets">
              {supportingAssets.map((assetUrl) => (
                <li key={assetUrl} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <span className="min-w-0 truncate text-sm text-slate-700 dark:text-slate-200">
                    {assetUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateCreationData({
                        supportingAssetUrls: supportingAssets.filter(
                          (value) => value !== assetUrl,
                        ),
                      })
                    }
                    className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-300 dark:hover:bg-red-950"
                    aria-label={`Remove asset ${assetUrl}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-between">
        <button type="button" onClick={handleBack} className="min-h-11 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
          Back: Milestones
        </button>
        <button type="button" onClick={handleNext} className="min-h-11 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
          Next: Review
        </button>
      </div>
    </section>
  );
}
