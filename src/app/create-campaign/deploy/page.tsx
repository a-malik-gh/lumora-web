"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { areMilestonesValid } from "@/lib/milestones";
import { useCampaignStore } from "@/stores/campaignStore";
import { useWalletSession } from "@/stores/walletStore";

const STATUS_COPY = {
  idle: "Ready to deploy",
  signing: "Waiting for wallet signature…",
  deploying: "Deploying campaign…",
  success: "Campaign deployed successfully",
  error: "Deployment failed",
} as const;

export default function CampaignDeployPage() {
  const router = useRouter();
  const creationData = useCampaignStore((state) => state.creationData);
  const deploymentStatus = useCampaignStore((state) => state.deploymentStatus);
  const deploymentError = useCampaignStore((state) => state.deploymentError);
  const setCreationStep = useCampaignStore((state) => state.setCreationStep);
  const setDeploymentStatus = useCampaignStore(
    (state) => state.setDeploymentStatus,
  );
  const { address, isConnected } = useWalletSession();
  const isBusy = deploymentStatus === "signing" || deploymentStatus === "deploying";
  const milestones = creationData.milestones ?? [];
  const isComplete = Boolean(
    creationData.title &&
      creationData.description &&
      creationData.goalAmount &&
      (creationData.acceptedAssets ?? []).length > 0 &&
      creationData.termsAccepted &&
      (milestones.length === 0 ||
        areMilestonesValid(creationData.goalAmount ?? 0, milestones)),
  );

  const handleBack = () => {
    setCreationStep(6);
    router.push("/create-campaign/review");
  };

  const handleDeploy = async () => {
    if (!isComplete) {
      toast.error("Review and confirm the campaign before deploying.");
      router.push("/create-campaign/review");
      return;
    }

    if (!isConnected || !address) {
      toast.error("Connect your wallet before deploying the campaign.");
      return;
    }

    try {
      setDeploymentStatus("signing");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDeploymentStatus("deploying");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const campaignId = `campaign-${Date.now()}`;
      setDeploymentStatus("success", null, campaignId);
      toast.success("Campaign deployed successfully.");
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The campaign could not be deployed.";
      setDeploymentStatus("error", message);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Deploy your campaign
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Confirm the transaction details, then approve the request in your
          wallet.
        </p>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <Detail label="Campaign" value={creationData.title || "Untitled campaign"} />
          <Detail
            label="Funding goal"
            value={`${creationData.currency ?? "$"}${(creationData.goalAmount ?? 0).toLocaleString()}`}
          />
          <Detail label="Wallet" value={address || "Not connected"} />
          <Detail
            label="Network"
            value={
              creationData.network === "mainnet"
                ? "Stellar mainnet"
                : "Stellar testnet"
            }
          />
          <Detail
            label="Accepted assets"
            value={(creationData.acceptedAssets ?? []).join(", ") || "None"}
          />
          <Detail label="Estimated fee" value="0.00001 XLM" />
          <Detail label="Milestones" value={`${milestones.length}`} />
        </dl>

        <div
          className={`mt-8 rounded-xl border p-4 ${
            deploymentStatus === "error"
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              : "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          }`}
          role="status"
          aria-live="polite"
        >
          <p className="font-semibold">{STATUS_COPY[deploymentStatus]}</p>
          {deploymentError && <p className="mt-1 text-sm">{deploymentError}</p>}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={isBusy}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Back: Review
        </button>
        <button
          type="button"
          onClick={handleDeploy}
          disabled={isBusy || deploymentStatus === "success"}
          className="min-h-11 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? STATUS_COPY[deploymentStatus] : "Deploy campaign"}
        </button>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 break-all font-semibold text-slate-950 dark:text-white">{value}</dd>
    </div>
  );
}
