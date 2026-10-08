/**
 * Derived weather advisories.
 * Open-Meteo's free tier ships no alert feed, so we synthesise honest,
 * data-driven advisories from the forecast itself.
 */

import {
  AlertTriangle,
  CloudLightning,
  Droplets,
  Flame,
  Snowflake,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import type { Forecast } from './api'
import { describe } from './weather'

export type AlertSeverity = 'severe' | 'warn' | 'info'

export interface WeatherAlert {
  id: string
  severity: AlertSeverity
  icon: LucideIcon
  title: string
  badge: string
  text: string
  details: string
}

export function deriveAlerts(f: Forecast): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  const today = 0
  const code = f.daily.weather_code[today]
  const { sky } = describe(code)
  const rainChance = f.daily.precipitation_probability_max[today] ?? 0
  const uv = f.daily.uv_index_max[today] ?? 0
  const wind = f.daily.wind_speed_10m_max[today] ?? 0
  const hi = f.daily.temperature_2m_max[today]
  const lo = f.daily.temperature_2m_min[today]

  if (sky === 'thunder') {
    alerts.push({
      id: 'thunder',
      severity: 'severe',
      icon: CloudLightning,
      title: describe(code).label,
      badge: 'Severe',
      text: 'Thunderstorms are expected today. Lightning and sudden downpours are possible through the afternoon.',
      details:
        'Seek shelter indoors during storms, avoid open ground and unplug sensitive electronics. Outdoor plans should have a covered backup.',
    })
  }

  if (rainChance >= 65) {
    alerts.push({
      id: 'rain',
      severity: rainChance >= 85 ? 'severe' : 'warn',
      icon: Droplets,
      title: 'Heavy rain expected',
      badge: rainChance >= 85 ? 'Watch' : 'Advisory',
      text: `Precipitation probability peaks at ${rainChance}% today. Wet roads and reduced visibility are likely during peak hours.`,
      details:
        'Allow extra travel time, keep headlights on while driving and secure loose outdoor items. Rain intensity is highest around midday and late afternoon.',
    })
  }

  if (uv >= 8) {
    alerts.push({
      id: 'uv',
      severity: uv >= 11 ? 'severe' : 'warn',
      icon: Sun,
      title: 'Very high UV index',
      badge: 'Health',
      text: `Peak UV index of ${uv.toFixed(0)} today. Unprotected skin can burn in under 15 minutes.`,
      details:
        'Use SPF 30+ sunscreen, wear a hat and sunglasses, and seek shade between 11 AM and 4 PM. Hydrate more than usual if you are outside.',
    })
  }

  if (wind >= 50) {
    alerts.push({
      id: 'wind',
      severity: wind >= 65 ? 'severe' : 'warn',
      icon: Wind,
      title: 'Strong wind gusts',
      badge: 'Advisory',
      text: `Gusts up to ${Math.round(wind)} km/h are forecast. Outdoor objects and cycling may be affected.`,
      details:
        'Secure trampolines, umbrellas and patio furniture. Driving — especially in high vehicles or on exposed bridges — will feel the crosswind.',
    })
  }

  if (hi >= 35) {
    alerts.push({
      id: 'heat',
      severity: hi >= 40 ? 'severe' : 'warn',
      icon: Flame,
      title: 'Extreme heat',
      badge: 'Heat',
      text: `A high of ${Math.round(hi)}°C is expected. Heat stress risk is elevated for outdoor activity.`,
      details:
        'Drink water frequently, avoid direct sun during peak hours, and check on vulnerable neighbours. Never leave people or pets in parked cars.',
    })
  }

  if (lo <= -5) {
    alerts.push({
      id: 'freeze',
      severity: 'warn',
      icon: Snowflake,
      title: 'Freezing conditions',
      badge: 'Cold',
      text: `Overnight low of ${Math.round(lo)}°C. Surfaces may freeze and black ice is possible on untreated roads.`,
      details:
        'Layer up before heading out, allow extra braking distance and let the car defog fully. Protect sensitive plants and outdoor plumbing.',
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'calm',
      severity: 'info',
      icon: AlertTriangle,
      title: 'No active advisories',
      badge: 'All clear',
      text: 'Conditions are settled for your area — nothing unusual in the next 7 days.',
      details:
        'We continuously re-check thunderstorms, heavy rain, UV extremes, wind and temperature thresholds. New advisories will surface here automatically.',
    })
  }

  return alerts
}
