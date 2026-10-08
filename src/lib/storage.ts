/** Tiny localStorage-backed persistence for theme, units and favorites. */

import type { UnitSystem } from './units'
import type { Place } from './api'

const KEYS = {
  theme: 'aether.theme',
  units: 'aether.units',
  favorites: 'aether.favorites',
  place: 'aether.place',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode — non fatal */
  }
}

export type Theme = 'dark' | 'light'

export const loadTheme = (): Theme => read<Theme>(KEYS.theme, 'dark')
export const saveTheme = (t: Theme) => write(KEYS.theme, t)

export const loadUnits = (): UnitSystem => read<UnitSystem>(KEYS.units, 'metric')
export const saveUnits = (u: UnitSystem) => write(KEYS.units, u)

export const loadFavorites = (): Place[] => read<Place[]>(KEYS.favorites, [])
export const saveFavorites = (f: Place[]) => write(KEYS.favorites, f)

export const loadPlace = (): Place | null => read<Place | null>(KEYS.place, null)
export const savePlace = (p: Place) => write(KEYS.place, p)

export const DEFAULT_PLACE: Place = {
  name: 'Lagos',
  admin1: 'Lagos State',
  country: 'Nigeria',
  country_code: 'NG',
  latitude: 6.5244,
  longitude: 3.3792,
}
