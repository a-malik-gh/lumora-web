import { CampaignCreationShell } from "@/components/campaign-creation/CampaignCreationShell";

export default function CreateCampaignLayout({ children }: { children: React.ReactNode }) {
  return <CampaignCreationShell>{children}</CampaignCreationShell>;
}
