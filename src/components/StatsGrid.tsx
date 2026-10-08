import {
  Droplets,
  Droplet,
  Eye,
  Gauge,
  Sparkles,
  Thermometer,
} from 'lucide-react'
import type { Forecast } from '../lib/api'
import type { UnitSystem } from '../lib/units'
import { precip, temp, tempUnit, visibility } from '../lib/units'

interface Props {
  forecast: Forecast
  units: UnitSystem
  nowIdx: number
}

/** Responsive glass grid of secondary weather statistics. */
export default function StatsGrid({ forecast, units, nowIdx }: Props) {
  const c = forecast.current
  const h = forecast.hourly
  const dew = h.dew_point_2m[nowIdx] ?? c.temperature_2m - 5

  const stats = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${c.relative_humidity_2m}%`,
      sub:
        c.relative_humidity_2m > 75
          ? 'Feels muggy'
          : c.relative_humidity_2m < 40
            ? 'Dry air'
            : 'Comfortable range',
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: visibility(h.visibility[nowIdx] ?? 10000, units),
      sub: (h.visibility[nowIdx] ?? 10000) < 2000 ? 'Reduced — drive carefully' : 'Clear sightlines',
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${Math.round(c.surface_pressure)} hPa`,
      sub:
        c.surface_pressure > 1015
          ? 'High — settled weather'
          : c.surface_pressure < 1000
            ? 'Low — change on the way'
            : 'Near average',
    },
    {
      icon: Sparkles,
      label: 'Dew point',
      value: `${temp(dew, units)}${tempUnit(units)}`,
      sub: dew >= 20 ? 'Sticky' : dew >= 14 ? 'Comfortable' : 'Crisp',
    },
    {
      icon: Droplet,
      label: 'Precipitation',
      value: precip(c.precipitation, units),
      sub: c.precipitation > 0 ? 'Falling right now' : 'Dry at the moment',
    },
    {
      icon: Thermometer,
      label: 'Feels like',
      value: `${temp(c.apparent_temperature, units)}${tempUnit(units)}`,
      sub:
        c.apparent_temperature > c.temperature_2m
          ? 'Humidity makes it warmer'
          : 'Wind makes it cooler',
    },
  ]

  return (
    <div className="grid grid--stats">
      {stats.map((s, i) => (
        <article
          key={s.label}
          className="stat-card glass-1 lift reveal"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <span className="stat-card__icon">
            <s.icon size={21} strokeWidth={1.8} />
          </span>
          <span>
            <span className="stat-card__label">{s.label}</span>
            <span className="stat-card__value">{s.value}</span>
            <span className="stat-card__sub">{s.sub}</span>
          </span>
        </article>
      ))}
    </div>
  )
}
