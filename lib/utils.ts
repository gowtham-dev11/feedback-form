export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function calculateNPS(scores: number[]): {
  nps: number
  promoters: number
  passives: number
  detractors: number
  promoterPct: number
  passivePct: number
  detractorPct: number
} {
  const total = scores.length
  if (total === 0) {
    return { nps: 0, promoters: 0, passives: 0, detractors: 0, promoterPct: 0, passivePct: 0, detractorPct: 0 }
  }
  const promoters = scores.filter((s) => s >= 9).length
  const passives = scores.filter((s) => s >= 7 && s <= 8).length
  const detractors = scores.filter((s) => s <= 6).length
  const promoterPct = Math.round((promoters / total) * 100)
  const passivePct = Math.round((passives / total) * 100)
  const detractorPct = Math.round((detractors / total) * 100)
  const nps = promoterPct - detractorPct
  return { nps, promoters, passives, detractors, promoterPct, passivePct, detractorPct }
}

export function avg(values: (number | null | undefined)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && v !== undefined)
  if (valid.length === 0) return null
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
}

export function parseMultiSelect(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

export function countOccurrences(items: string[][]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const arr of items) {
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1
    }
  }
  return counts
}

export function formatRating(val: number | null): string {
  if (val === null) return 'N/A'
  return `${val.toFixed(1)} / 5`
}

export function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 3.5) return 'Good'
  if (rating >= 2.5) return 'Average'
  if (rating >= 1.5) return 'Fair'
  return 'Poor'
}
