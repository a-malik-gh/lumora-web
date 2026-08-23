import { create } from "zustand";
import {
  createJSONStorage,
  devtools,
  persist,
  type StateStorage,
} from "zustand/middleware";
import type { CampaignCreationStepId } from "@/lib/campaignCreation";
import type { Campaign } from "@/types/campaign";

export const CAMPAIGN_CREATION_STORAGE_KEY = "lumora-campaign-creation";

export interface MilestoneDraft {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

export interface CampaignCreationData
  extends Omit<
    Campaign,
    "id" | "raisedAmount" | "donorCount" | "createdAt" | "isVerified"
  > {
  termsAccepted: boolean;
  milestones: MilestoneDraft[];
  milestoneDraft: MilestoneDraft;
  supportingAssetUrls: string[];
  assetDraftUrl: string;
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

const EMPTY_MILESTONE: MilestoneDraft = {
  title: "",
  description: "",
  amount: 0,
  dueDate: "",
};

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
    milestoneDraft: { ...EMPTY_MILESTONE },
    supportingAssetUrls: [],
    assetDraftUrl: "",
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
