/** Time helpers. Open-Meteo with timezone=auto returns strings in the *location's* local time. */

const HOUR12 = (h: number) => {
  const hh = h % 12 === 0 ? 12 : h % 12
  return hh
}

/** '2026-10-07T13:00' → '1 PM' */
export function formatHour(iso: string): string {
  const h = Number(iso.slice(11, 13))
  return `${HOUR12(h)} ${h < 12 ? 'AM' : 'PM'}`
}

/** '2026-10-07T13:00' → '1:00 PM'-style compact clock, minute kept if non-zero. */
export function formatClock(iso: string): string {
  const h = Number(iso.slice(11, 13))
  const m = iso.slice(14, 16)
  return m && m !== '00' ? `${HOUR12(h)}:${m} ${h < 12 ? 'AM' : 'PM'}` : formatHour(iso)
}

const WEEKDAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parts(iso: string) {
  return {
    y: Number(iso.slice(0, 4)),
    mo: Number(iso.slice(5, 7)) - 1,
    d: Number(iso.slice(8, 10)),
    h: Number(iso.slice(11, 13)),
  }
}

/** '2026-10-07' → 'Wednesday, October 7' */
export function formatDate(iso: string): string {
  const p = parts(iso)
  const date = new Date(p.y, p.mo, p.d)
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[p.mo]} ${p.d}`
}

/** '2026-10-07' → 'Wed' */
export function weekdayShort(iso: string): string {
  const p = parts(iso)
  return WEEKDAYS[new Date(p.y, p.mo, p.d).getDay()].slice(0, 3)
}

/** '2026-10-07' → 'Oct 7' */
export function dateShort(iso: string): string {
  const p = parts(iso)
  return `${MONTHS[p.mo].slice(0, 3)} ${p.d}`
}

/** Position of `nowIso` inside a list of hourly ISO stamps (or nearest following). */
export function nowIndex(times: string[], nowIso: string): number {
  const hourKey = nowIso.slice(0, 13)
  const exact = times.findIndex((t) => t.slice(0, 13) === hourKey)
  if (exact >= 0) return exact
  const after = times.findIndex((t) => t > nowIso)
  return after >= 0 ? after : 0
}

/** Minute-of-day from an ISO local timestamp. */
export function minuteOfDay(iso: string): number {
  return Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16))
}

/** Whole-day ISO date of an ISO timestamp. */
export function dayOf(iso: string): string {
  return iso.slice(0, 10)
}

/** Minutes-of-day → '13:37' (24h, wraps at midnight). */
export function minutesToClock(min: number): string {
  const m = ((Math.floor(min) % 1440) + 1440) % 1440
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  return `${hh}:${mm}`
}
