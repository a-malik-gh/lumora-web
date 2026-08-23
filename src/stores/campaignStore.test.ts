import { beforeEach, describe, expect, it, vi } from "vitest";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe("campaign creation persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  it("restores the current step and in-progress form fields after a reload", async () => {
    const firstLoad = await import("@/stores/campaignStore");

    firstLoad.useCampaignStore.getState().updateCreationData({
      title: "A community solar library",
      description: "A persisted story that should still exist after reload.",
      assetDraftUrl: "https://example.com/in-progress-photo.jpg",
      milestoneDraft: {
        title: "Install the panels",
        description: "",
        amount: 2500,
        dueDate: "2026-10-01",
      },
    });
    firstLoad.useCampaignStore.getState().setCreationStep(4);

    expect(
      localStorage.getItem(firstLoad.CAMPAIGN_CREATION_STORAGE_KEY),
    ).toContain("A community solar library");

    vi.resetModules();
    const refreshed = await import("@/stores/campaignStore");

    expect(refreshed.useCampaignStore.getState().hasHydrated).toBe(false);
    await refreshed.useCampaignStore.persist.rehydrate();

    const restored = refreshed.useCampaignStore.getState();
    expect(restored.hasHydrated).toBe(true);
    expect(restored.creationStep).toBe(4);
    expect(restored.creationData.title).toBe("A community solar library");
    expect(restored.creationData.assetDraftUrl).toBe(
      "https://example.com/in-progress-photo.jpg",
    );
    expect(restored.creationData.milestoneDraft?.title).toBe(
      "Install the panels",
    );
  });

  it("does not persist transient deployment status", async () => {
    const firstLoad = await import("@/stores/campaignStore");
    firstLoad.useCampaignStore
      .getState()
      .setDeploymentStatus("error", "Temporary network error");

    vi.resetModules();
    const refreshed = await import("@/stores/campaignStore");
    await refreshed.useCampaignStore.persist.rehydrate();

    expect(refreshed.useCampaignStore.getState().deploymentStatus).toBe(
      "idle",
    );
    expect(refreshed.useCampaignStore.getState().deploymentError).toBeNull();
  });
});
