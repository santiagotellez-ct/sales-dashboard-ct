export function formatCurrency(value: number): string {
  return '\$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function formatPercent(value: number, decimals = 0): string {
  return value.toFixed(decimals) + '%'
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
