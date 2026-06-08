// Revenue targets per quarter (USD) — update these as targets are confirmed
// TODO: move this to a DB table (e.g. revenue_targets) when ready
export const QUARTERLY_REVENUE_TARGETS: Record<number, Record<number, number>> = {
  2026: {
    1: 500_000,
    2: 600_000,
    3: 700_000,
    4: 800_000,
  },
}

export function getRevenueTarget(year: number, quarter: number): number {
  return QUARTERLY_REVENUE_TARGETS[year]?.[quarter] ?? 500_000
}

// Hot deal threshold (USD) — deals above this value are considered "hot"
export const HOT_DEAL_THRESHOLD = 20_000

// Days without movement before a deal is considered "stalled"
export const STALLED_DEAL_DAYS = 7

// Auto-refresh interval in milliseconds
export const REFRESH_INTERVAL = 2 * 60 * 1000
