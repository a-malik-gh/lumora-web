export const CAMPAIGN_CREATION_STEPS = [
  { id: 1, name: "Basics", path: "/create-campaign/basic" },
  { id: 2, name: "Story", path: "/create-campaign/story" },
  { id: 3, name: "Milestones", path: "/create-campaign/milestones" },
  { id: 4, name: "Assets", path: "/create-campaign/assets" },
  { id: 5, name: "Review", path: "/create-campaign/review" },
  { id: 6, name: "Deploy", path: "/create-campaign/deploy" },
] as const;

export type CampaignCreationStepId =
  (typeof CAMPAIGN_CREATION_STEPS)[number]["id"];

export function isCampaignCreationStepId(
  value: number,
): value is CampaignCreationStepId {
  return CAMPAIGN_CREATION_STEPS.some((step) => step.id === value);
}

export function getCampaignCreationStep(pathname: string) {
  return CAMPAIGN_CREATION_STEPS.find((step) => step.path === pathname);
}

export function getCampaignCreationPath(stepId: number) {
  return (
    CAMPAIGN_CREATION_STEPS.find((step) => step.id === stepId)?.path ??
    CAMPAIGN_CREATION_STEPS[0].path
  );
}
