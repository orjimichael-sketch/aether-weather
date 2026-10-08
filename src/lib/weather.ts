import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'

/** Visual families that drive icons, copy and background scenes. */
export type Sky =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'

export interface Condition {
  label: string
  sky: Sky
}

/** WMO weather interpretation codes → human label + visual family. */
const CODES: Record<number, Condition> = {
  0: { label: 'Clear sky', sky: 'clear' },
  1: { label: 'Mainly clear', sky: 'clear' },
  2: { label: 'Partly cloudy', sky: 'partly' },
  3: { label: 'Overcast', sky: 'cloudy' },
  45: { label: 'Fog', sky: 'fog' },
  48: { label: 'Depositing rime fog', sky: 'fog' },
  51: { label: 'Light drizzle', sky: 'drizzle' },
  53: { label: 'Drizzle', sky: 'drizzle' },
  55: { label: 'Dense drizzle', sky: 'drizzle' },
  56: { label: 'Freezing drizzle', sky: 'drizzle' },
  57: { label: 'Dense freezing drizzle', sky: 'drizzle' },
  61: { label: 'Light rain', sky: 'rain' },
  63: { label: 'Moderate rain', sky: 'rain' },
  65: { label: 'Heavy rain', sky: 'rain' },
  66: { label: 'Freezing rain', sky: 'rain' },
  67: { label: 'Heavy freezing rain', sky: 'rain' },
  71: { label: 'Light snowfall', sky: 'snow' },
  73: { label: 'Snowfall', sky: 'snow' },
  75: { label: 'Heavy snowfall', sky: 'snow' },
  77: { label: 'Snow grains', sky: 'snow' },
  80: { label: 'Rain showers', sky: 'rain' },
  81: { label: 'Moderate showers', sky: 'rain' },
  82: { label: 'Violent rain showers', sky: 'rain' },
  85: { label: 'Snow showers', sky: 'snow' },
  86: { label: 'Heavy snow showers', sky: 'snow' },
  95: { label: 'Thunderstorm', sky: 'thunder' },
  96: { label: 'Thunderstorm with hail', sky: 'thunder' },
  99: { label: 'Severe thunderstorm', sky: 'thunder' },
}

export function describe(code: number): Condition {
  return CODES[code] ?? { label: 'Unknown', sky: 'cloudy' }
}

/** Minimal lucide icon for a condition (day/night aware). */
export function iconFor(code: number, isDay: boolean): LucideIcon {
  const { sky } = describe(code)
  switch (sky) {
    case 'clear':
      return isDay ? Sun : Moon
    case 'partly':
      return isDay ? CloudSun : CloudMoon
    case 'fog':
      return CloudFog
    case 'drizzle':
      return CloudDrizzle
    case 'rain':
      return CloudRain
    case 'snow':
      return CloudSnow
    case 'thunder':
      return CloudLightning
    default:
      return Cloud
  }
}

/** Background scene id for the atmospheric layer. */
export type Scene = 'sunny' | 'cloudy' | 'rain' | 'thunder' | 'snow' | 'night'

export function sceneFor(code: number, isDay: boolean): Scene {
  const { sky } = describe(code)
  if (!isDay) return 'night'
  switch (sky) {
    case 'clear':
    case 'partly':
      return 'sunny'
    case 'fog':
      return 'cloudy'
    case 'drizzle':
    case 'rain':
      return 'rain'
    case 'snow':
      return 'snow'
    case 'thunder':
      return 'thunder'
    default:
      return 'cloudy'
  }
}

/* ---------- UV index bands (WHO scale) ---------- */

export function uvBand(uv: number): { label: string; pct: number } {
  if (uv < 3) return { label: 'Low', pct: (uv / 3) * 25 }
  if (uv < 6) return { label: 'Moderate', pct: 25 + ((uv - 3) / 3) * 25 }
  if (uv < 8) return { label: 'High', pct: 50 + ((uv - 6) / 2) * 25 }
  if (uv < 11) return { label: 'Very High', pct: 75 + ((uv - 8) / 3) * 25 }
  return { label: 'Extreme', pct: 100 }
}

/* ---------- US AQI bands ---------- */

export function aqiBand(aqi: number): { label: string; pct: number } {
  const pct = Math.min(100, (aqi / 300) * 100)
  if (aqi <= 50) return { label: 'Good', pct }
  if (aqi <= 100) return { label: 'Moderate', pct }
  if (aqi <= 150) return { label: 'Unhealthy (sensitive)', pct }
  if (aqi <= 200) return { label: 'Unhealthy', pct }
  if (aqi <= 300) return { label: 'Very unhealthy', pct }
  return { label: 'Hazardous', pct }
}

/* ---------- Wind direction → 16-point compass label ---------- */

export function compass(deg: number): string {
  const dirs = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ]
  return dirs[Math.round((deg % 360) / 22.5) % 16]
}

/** Beaufort-style descriptor for wind speed (km/h). */
export function windDescriptor(kmh: number): string {
  if (kmh < 2) return 'Calm'
  if (kmh < 12) return 'Light breeze'
  if (kmh < 30) return 'Moderate'
  if (kmh < 50) return 'Fresh breeze'
  if (kmh < 62) return 'Strong'
  if (kmh < 75) return 'Near gale'
  return 'Gale'
}
