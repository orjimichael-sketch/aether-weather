import {
  Droplets,
  Eye,
  Gauge,
  Heart,
  MapPin,
  Navigation,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import type { Forecast, Place } from '../lib/api'
import type { UnitSystem } from '../lib/units'
import { temp, tempUnit, visibility, wind as fmtWind } from '../lib/units'
import { describe, iconFor, uvBand } from '../lib/weather'
import { formatDate, minutesToClock } from '../lib/time'

interface Props {
  place: Place
  forecast: Forecast
  units: UnitSystem
  uv: number
  visibilityM: number
  nowMinutes: number
  isFavorite: boolean
  onToggleFavorite: () => void
  onRefresh: () => void
  refreshing: boolean
}

/** The centrepiece: a large elevated glass panel with the current conditions. */
export default function CurrentWeather({
  place,
  forecast,
  units,
  uv,
  visibilityM,
  nowMinutes,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  refreshing,
}: Props) {
  const c = forecast.current
  const today = forecast.daily
  const isDay = c.is_day === 1
  const cond = describe(c.weather_code)
  const Icon = iconFor(c.weather_code, isDay)
  const meta = [place.admin1, place.country].filter(Boolean).join(', ')

  const chips = [
    { icon: Wind, label: 'Wind', value: fmtWind(c.wind_speed_10m, units) },
    { icon: Droplets, label: 'Humidity', value: `${c.relative_humidity_2m}%` },
    { icon: Gauge, label: 'Pressure', value: `${Math.round(c.surface_pressure)} hPa` },
    { icon: Eye, label: 'Visibility', value: visibility(visibilityM, units) },
    { icon: Sun, label: 'UV', value: `${uv.toFixed(0)} · ${uvBand(uv).label}` },
    { icon: Thermometer, label: 'Precip', value: `${c.precipitation.toFixed(1)} mm` },
  ]

  return (
    <section className="current glass-3 glass-card sheen depth reveal" aria-label="Current weather">
      <div className="card-body">
        <div className="current__top">
          <div>
            <h1 className="current__place">
              <MapPin size={20} strokeWidth={2} />
              <span>
                {place.name}
                {meta && (
                  <span style={{ fontWeight: 400, fontSize: '0.78em', color: 'var(--ink-2)' }}>
                    , {meta}
                  </span>
                )}
              </span>
            </h1>
            <p className="current__date">
              {formatDate(c.time)} · Local time {minutesToClock(nowMinutes)} ({forecast.timezone_abbreviation ?? forecast.timezone})
            </p>
          </div>

          <div className="current__actions">
            <button
              type="button"
              className={`glass-btn icon-only${isFavorite ? ' is-active' : ''}`}
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart
                size={18}
                strokeWidth={1.9}
                className={isFavorite ? 'heart-on' : undefined}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </button>
            <button
              type="button"
              className="glass-btn icon-only"
              onClick={onRefresh}
              aria-label="Refresh forecast"
              title="Refresh"
            >
              <RefreshCw size={17} strokeWidth={1.9} className={refreshing ? 'spin' : undefined} />
            </button>
          </div>
        </div>

        <div className="current__inner">
          <div className="current__hero">
            <Icon
              className="current__icon float-soft"
              size={84}
              strokeWidth={1.1}
              aria-hidden="true"
            />
            <div className="current__temp">
              {temp(c.temperature_2m, units)}
              <sup>{tempUnit(units)}</sup>
            </div>
          </div>

          <div className="current__meta">
            <div className="current__condition">{cond.label}</div>
            <div className="current__feels">
              Feels like {temp(c.apparent_temperature, units)}{tempUnit(units)}
            </div>
            <div className="current__hilo">
              <span>
                H <b>{temp(today.temperature_2m_max[0], units)}°</b>
              </span>
              <span>
                L <b>{temp(today.temperature_2m_min[0], units)}°</b>
              </span>
              <span>
                {isDay ? 'Daytime' : 'Night'} <Navigation size={13} strokeWidth={2} style={{ verticalAlign: '-2px' }} />
              </span>
            </div>
          </div>
        </div>

        <div className="current__chips">
          {chips.map((chip) => (
            <span className="chip" key={chip.label}>
              <chip.icon size={14} strokeWidth={2} />
              {chip.label} <b>{chip.value}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Lightweight skeleton used on first paint. */
export function CurrentSkeleton() {
  return (
    <section className="current glass-3 glass-card depth" aria-hidden="true">
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="skeleton" style={{ height: 28, width: '46%' }} />
        <div className="skeleton" style={{ height: 120, width: '70%' }} />
        <div className="skeleton" style={{ height: 44, width: '90%' }} />
      </div>
    </section>
  )
}
