import { create } from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
  type StateStorage,
} from "zustand/middleware";
import type { CampaignCreationStepId } from "@/lib/campaignCreation";
import type {
  AcceptedAsset,
  CampaignNetwork,
  DurationPreset,
} from "@/lib/fundingConfig";
import type { Campaign } from "@/types/campaign";

export const CAMPAIGN_CREATION_STORAGE_KEY = "lumora-campaign-creation";

export interface MilestoneDraft {
  title: string;
  description: string;
  /** Cumulative funding target this milestone unlocks at. */
  amount: number;
  /** Expected completion date (yyyy-mm-dd). */
  dueDate: string;
}

export interface CampaignCreationData
  extends Omit<
    Campaign,
    "id" | "raisedAmount" | "donorCount" | "createdAt" | "isVerified"
  > {
  termsAccepted: boolean;
  milestones: MilestoneDraft[];
  supportingAssetUrls: string[];
  assetDraftUrl: string;
  acceptedAssets: AcceptedAsset[];
  durationPreset: DurationPreset;
  customDurationDays: number;
  minimumDonation: number;
  network: CampaignNetwork;
  updates: Array<{ title: string; content: string; createdAt: string }>;
}

export type DeploymentStatus =
  | "idle"
  | "signing"
  | "deploying"
  | "success"
  | "error";

export interface CampaignState {
  creationStep: CampaignCreationStepId;
  creationData: Partial<CampaignCreationData>;
  hasHydrated: boolean;
  deploymentStatus: DeploymentStatus;
  deploymentError: string | null;
  deployedCampaignId: string | null;
  setCreationStep: (step: CampaignCreationStepId) => void;
  updateCreationData: (data: Partial<CampaignCreationData>) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  resetCreationData: () => void;
  setDeploymentStatus: (
    status: DeploymentStatus,
    error?: string | null,
    campaignId?: string | null,
  ) => void;
  resetCampaign: () => void;
}

const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function getCampaignStorage(): StateStorage {
  return typeof localStorage === "undefined" ? serverStorage : localStorage;
}

function createInitialCreationData(): Partial<CampaignCreationData> {
  return {
    title: "",
    description: "",
    coverImage: "",
    goalAmount: 0,
    currency: "$",
    endDate: "",
    creatorAddress: "",
    creatorName: "",
    category: "general",
    status: "draft",
    termsAccepted: false,
    milestones: [],
    supportingAssetUrls: [],
    assetDraftUrl: "",
    acceptedAssets: ["XLM"],
    durationPreset: 30,
    customDurationDays: 30,
    minimumDonation: 0,
    network: "testnet",
    updates: [],
  };
}

function createInitialCampaignState() {
  return {
    creationStep: 1 as CampaignCreationStepId,
    creationData: createInitialCreationData(),
    hasHydrated: false,
    deploymentStatus: "idle" as DeploymentStatus,
    deploymentError: null,
    deployedCampaignId: null,
  };
}

export const useCampaignStore = create<CampaignState>()(
  devtools(
    persist(
      (set) => ({
        ...createInitialCampaignState(),
        setCreationStep: (creationStep) =>
          set({ creationStep }, false, "campaign/setCreationStep"),
        updateCreationData: (data) =>
          set(
            (state) => ({
              creationData: { ...state.creationData, ...data },
            }),
            false,
            "campaign/updateCreationData",
          ),
        setHasHydrated: (hasHydrated) =>
          set({ hasHydrated }, false, "campaign/setHasHydrated"),
        resetCreationData: () =>
          set(
            {
              creationData: createInitialCreationData(),
              creationStep: 1,
              deploymentStatus: "idle",
              deploymentError: null,
              deployedCampaignId: null,
            },
            false,
            "campaign/resetCreationData",
          ),
        setDeploymentStatus: (
          deploymentStatus,
          deploymentError = null,
          deployedCampaignId = null,
        ) =>
          set(
            { deploymentStatus, deploymentError, deployedCampaignId },
            false,
            "campaign/setDeploymentStatus",
          ),
        resetCampaign: () =>
          set(createInitialCampaignState(), false, "campaign/resetCampaign"),
      }),
      {
        name: CAMPAIGN_CREATION_STORAGE_KEY,
        storage: createJSONStorage(getCampaignStorage),
        version: 1,
        skipHydration: true,
        partialize: (state) => ({
          creationStep: state.creationStep,
          creationData: state.creationData,
        }),
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<CampaignState>;

          return {
            ...currentState,
            ...persisted,
            creationData: {
              ...currentState.creationData,
              ...persisted.creationData,
            },
            hasHydrated: currentState.hasHydrated,
          };
        },
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
    {
      name: "campaign-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
