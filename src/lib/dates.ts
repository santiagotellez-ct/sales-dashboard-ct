import type { Quarter } from '@/types'

export function getQuarterFromDate(date: Date): Quarter {
  const month = date.getMonth()
  if (month < 3) return 1
  if (month < 6) return 2
  if (month < 9) return 3
  return 4
}

export function getQuarterDateRange(year: number, quarter: Quarter): { start: Date; end: Date } {
  const startMonth = (quarter - 1) * 3
  return {
    start: new Date(year, startMonth, 1, 0, 0, 0),
    end: new Date(year, startMonth + 3, 0, 23, 59, 59),
  }
}

export function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  )
}

export function getCurrentQuarter(): Quarter {
  return getQuarterFromDate(new Date())
}

export function getCurrentISOWeek(): number {
  return getISOWeek(new Date())
}

export function getWeeksInQuarter(year: number, quarter: Quarter): number[] {
  const { start, end } = getQuarterDateRange(year, quarter)
  const weeks: number[] = []
  const current = new Date(start)
  while (current <= end) {
    const week = getISOWeek(current)
    if (!weeks.includes(week)) weeks.push(week)
    current.setDate(current.getDate() + 7)
  }
  return weeks.sort((a, b) => a - b)
}

export function isInQuarter(dateStr: string, year: number, quarter: Quarter): boolean {
  const date = new Date(dateStr)
  const { start, end } = getQuarterDateRange(year, quarter)
  return date >= start && date <= end
}

export function isInWeek(dateStr: string, isoWeek: number): boolean {
  const date = new Date(dateStr)
  return getISOWeek(date) === isoWeek
}

export function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}
