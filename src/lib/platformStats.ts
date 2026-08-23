export interface NormalizedPlatformStats {
  totalTransactions: number;
  xlmRaised: number;
  contractsDeployed: number;
  totalRaised?: number;
  activeCampaigns?: number;
  totalDonors?: number;
}

export function normalizePlatformStats(
  payload: Record<string, unknown> | null | undefined,
): NormalizedPlatformStats {
  const safeParse = (value: unknown): number => {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const data = payload ?? {};

  return {
    totalTransactions: safeParse(
      data.totalTransactions ??
        data.transactions ??
        data.totalTxs ??
        data.totalTransactionsCount,
    ),
    xlmRaised: safeParse(
      data.totalRaisedXlm ??
        data.xlmRaised ??
        data.totalRaised ??
        data.raisedXlm,
    ),
    contractsDeployed: safeParse(
      data.contractsDeployed ?? data.contracts ?? data.smartContractsDeployed,
    ),
    totalRaised: safeParse(data.totalRaised),
    activeCampaigns: safeParse(data.activeCampaigns),
    totalDonors: safeParse(data.totalDonors),
  };
}

export function formatMetricValue(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0";
  }

  if (value === 0) {
    return "0";
  }

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    const millions = absValue / 1_000_000;
    return `${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
  }

  if (absValue >= 1_000) {
    const thousands = absValue / 1_000;
    return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}K`;
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: absValue < 1 ? 2 : 0,
  });
}
