"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  CAMPAIGN_CREATION_STEPS,
  getCampaignCreationPath,
  getCampaignCreationStep,
} from "@/lib/campaignCreation";
import { useCampaignStore } from "@/stores/campaignStore";

export function CampaignCreationShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const creationStep = useCampaignStore((state) => state.creationStep);
  const hasHydrated = useCampaignStore((state) => state.hasHydrated);
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);
  const setHasHydrated = useCampaignStore((state) => state.setHasHydrated);
  const activeStep = getCampaignCreationStep(pathname);

  useEffect(() => {
    const hydration = useCampaignStore.persist.rehydrate();
    void Promise.resolve(hydration).finally(() => setHasHydrated(true));
  }, [setHasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (pathname === "/create-campaign") {
      router.replace(getCampaignCreationPath(creationStep));
      return;
    }

    if (activeStep && activeStep.id !== creationStep) {
      setCreationStep(activeStep.id);
    }
  }, [activeStep, creationStep, hasHydrated, pathname, router, setCreationStep]);

  if (!hasHydrated || pathname === "/create-campaign") {
    return (
      <div
        className="grid min-h-[60vh] place-items-center bg-slate-50 px-4 dark:bg-slate-950"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Restoring your campaign draft…
        </p>
      </div>
    );
  }

  const currentStep = activeStep?.id ?? creationStep;
  const progress = Math.round(
    (currentStep / CAMPAIGN_CREATION_STEPS.length) * 100,
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Create a campaign
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                {activeStep?.name ?? "Campaign draft"}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Step {currentStep} of {CAMPAIGN_CREATION_STEPS.length}. Your
                draft is saved in this browser automatically.
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {progress}%
            </span>
          </div>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            role="progressbar"
            aria-label="Campaign creation progress"
            aria-valuemin={1}
            aria-valuemax={CAMPAIGN_CREATION_STEPS.length}
            aria-valuenow={currentStep}
            aria-valuetext={`Step ${currentStep} of ${CAMPAIGN_CREATION_STEPS.length}: ${activeStep?.name ?? "Campaign draft"}`}
          >
            <div
              className="h-full rounded-full bg-indigo-600 transition-[width] motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <nav className="mt-5 overflow-x-auto" aria-label="Campaign creation steps">
            <ol className="flex min-w-max items-center gap-2">
              {CAMPAIGN_CREATION_STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isComplete = step.id < currentStep;

                return (
                  <li key={step.id}>
                    <Link
                      href={step.path}
                      onClick={() => setCreationStep(step.id)}
                      aria-current={isActive ? "step" : undefined}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
                        isActive
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : isComplete
                            ? "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      <span aria-hidden="true">{isComplete ? "✓" : step.id}</span>
                      {step.name}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
