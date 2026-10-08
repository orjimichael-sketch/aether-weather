/** Unit system + conversion/format helpers. All API data arrives metric. */

export type UnitSystem = 'metric' | 'imperial'

export const c2f = (c: number) => (c * 9) / 5 + 32
export const kmh2mph = (kmh: number) => kmh * 0.621371
export const km2mi = (km: number) => km * 0.621371
export const mm2in = (mm: number) => mm / 25.4

/** Display temperature as an integer (unit aware). */
export function temp(c: number, units: UnitSystem): number {
  const v = units === 'metric' ? c : c2f(c)
  return Math.round(v)
}

/** Raw numeric value for charts (unit aware, one decimal kept for F). */
export function tempRaw(c: number, units: UnitSystem): number {
  const v = units === 'metric' ? c : c2f(c)
  return Math.round(v * 10) / 10
}

export const tempUnit = (units: UnitSystem) => (units === 'metric' ? '°C' : '°F')

export function wind(kmh: number, units: UnitSystem): string {
  return units === 'metric'
    ? `${Math.round(kmh)} km/h`
    : `${Math.round(kmh2mph(kmh))} mph`
}

/** Visibility arrives in metres. */
export function visibility(m: number, units: UnitSystem): string {
  return units === 'metric'
    ? `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`
    : `${(km2mi(m / 1000)).toFixed(m < 16093 ? 1 : 0)} mi`
}

export function precip(mm: number, units: UnitSystem): string {
  return units === 'metric'
    ? `${mm.toFixed(1)} mm`
    : `${mm2in(mm).toFixed(2)} in`
}
