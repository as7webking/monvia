const rates: Record<string, number> = {
  USD: 1,
  EUR: 0.91,
  GBP: 0.80,
  CHF: 0.89,
  DKK: 6.95,
  NOK: 10.27,
  SEK: 9.72,
  PLN: 4.20,
  CZK: 24.80,
  HUF: 353.0,
  RON: 4.43,
  BGN: 1.78,
  JPY: 144.41,
}

export function convertToCurrency(amount: number, from: string, to: string) {
  const fromRate = rates[from] ?? 1
  const toRate = rates[to] ?? 1
  const base = amount / fromRate
  return Number((base * toRate).toFixed(2))
}

export const currencyOptions = [
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'DKK',
  'NOK',
  'SEK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'JPY',
]
