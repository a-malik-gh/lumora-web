import { normalizePlatformStats, formatMetricValue } from '../platformStats';

describe('platformStats', () => {
  describe('normalizePlatformStats', () => {
    it('should return zero for all stats if the payload is null or undefined', () => {
      expect(normalizePlatformStats(null)).toEqual({
        totalTransactions: 0,
        xlmRaised: 0,
        contractsDeployed: 0,
        totalRaised: 0,
        activeCampaigns: 0,
        totalDonors: 0,
      });

      expect(normalizePlatformStats(undefined)).toEqual({
        totalTransactions: 0,
        xlmRaised: 0,
        contractsDeployed: 0,
        totalRaised: 0,
        activeCampaigns: 0,
        totalDonors: 0,
      });
    });

    it('should handle different field names for stats', () => {
      const payload = {
        transactions: 100,
        totalRaisedXlm: 5000,
        contracts: 10,
        totalRaised: 10000,
        activeCampaigns: 5,
        totalDonors: 50,
      };

      const normalized = normalizePlatformStats(payload);

      expect(normalized).toEqual({
        totalTransactions: 100,
        xlmRaised: 5000,
        contractsDeployed: 10,
        totalRaised: 10000,
        activeCampaigns: 5,
        totalDonors: 50,
      });
    });

    it('should return zero for invalid or negative stat values', () => {
      const payload = {
        totalTransactions: 'invalid',
        xlmRaised: -500,
        contractsDeployed: null,
        totalRaised: undefined,
        activeCampaigns: 0,
        totalDonors: -10,
      };

      const normalized = normalizePlatformStats(payload);

      expect(normalized).toEqual({
        totalTransactions: 0,
        xlmRaised: 0,
        contractsDeployed: 0,
        totalRaised: 0,
        activeCampaigns: 0,
        totalDonors: 0,
      });
    });
  });

  describe('formatMetricValue', () => {
    it('should return '0' for null, undefined, or non-finite values', () => {
      expect(formatMetricValue(null)).toBe('0');
      expect(formatMetricValue(undefined)).toBe('0');
      expect(formatMetricValue(NaN)).toBe('0');
      expect(formatMetricValue(Infinity)).toBe('0');
    });

    it('should format large numbers with compact notation', () => {
      expect(formatMetricValue(1_000_000)).toBe('1M');
      expect(formatMetricValue(1_500_000)).toBe('1.5M');
      expect(formatMetricValue(1_000)).toBe('1K');
      expect(formatMetricValue(2_500)).toBe('2.5K');
    });

    it('should format numbers less than 1,000 with locale string', () => {
      expect(formatMetricValue(500)).toBe('500');
      expect(formatMetricValue(0.123)).toBe('0.12');
    });

    it('should handle zero and negative values correctly', () => {
      expect(formatMetricValue(0)).toBe('0');
      expect(formatMetricValue(-500)).toBe('-500');
      expect(formatMetricValue(-1_500_000)).toBe('-1.5M');
    });
  });
});