import {
  Compass,
  Droplet,
  Leaf,
  Navigation,
  Sun,
} from 'lucide-react'
import type { AirQuality, Forecast } from '../lib/api'
import type { UnitSystem } from '../lib/units'
import { wind as fmtWind } from '../lib/units'
import { aqiBand, compass, uvBand, windDescriptor } from '../lib/weather'
import { formatHour } from '../lib/time'

/* ---------------- UV INDEX ---------------- */

export function UVCard({ uv }: { uv: number }) {
  const band = uvBand(uv)
  return (
    <section className="gauge-card glass-2 glass-card sheen lift reveal" aria-label="UV index">
      <div className="card-body gauge-card__inner">
        <span className="gauge-card__label">
          <Sun size={15} strokeWidth={2} /> UV Index
        </span>
        <span className="gauge-card__value">
          {uv.toFixed(0)}
          <small>/ 11+</small>
        </span>
        <span className="gauge-card__status">{band.label}</span>
        <div className="gauge-track">
          <span className="gauge-track__fill" style={{ width: `${Math.min(band.pct, 100)}%` }} />
        </div>
        <div className="gauge-ticks">
          <span>0 Low</span>
          <span>3</span>
          <span>6</span>
          <span>8+</span>
        </div>
        <div className="gauge-card__rows">
          <span className="gauge-row">
            <span>Protection advice</span>
            <b>{uv >= 6 ? 'SPF 30+ required' : uv >= 3 ? 'Midday shade' : 'No risk'}</b>
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------------- AIR QUALITY ---------------- */

export function AirQualityCard({ air }: { air: AirQuality | null }) {
  const cur = air?.current
  const aqi = cur?.us_aqi
  const has = typeof aqi === 'number' && !Number.isNaN(aqi)
  const band = has ? aqiBand(aqi as number) : null

  return (
    <section className="gauge-card glass-2 glass-card sheen lift reveal" aria-label="Air quality">
      <div className="card-body gauge-card__inner">
        <span className="gauge-card__label">
          <Leaf size={15} strokeWidth={2} /> Air quality
        </span>
        <span className="gauge-card__value">
          {has ? Math.round(aqi as number) : '—'}
          <small>US AQI</small>
        </span>
        <span className="gauge-card__status">
          {band ? band.label : 'Unavailable here'}
        </span>
        <div className="gauge-track">
          <span
            className="gauge-track__fill"
            style={{ width: `${band ? Math.min(band.pct, 100) : 0}%` }}
          />
        </div>
        <div className="gauge-ticks">
          <span>0 Good</span>
          <span>100</span>
          <span>200</span>
          <span>300+</span>
        </div>
        <div className="gauge-card__rows">
          <span className="gauge-row">
            <span>PM2.5</span>
            <b>{cur?.pm2_5 != null ? `${cur.pm2_5.toFixed(1)} µg/m³` : '—'}</b>
          </span>
          <span className="gauge-row">
            <span>Ozone</span>
            <b>{cur?.ozone != null ? `${cur.ozone.toFixed(0)} µg/m³` : '—'}</b>
          </span>
          <span className="gauge-row">
            <span>NO₂</span>
            <b>{cur?.nitrogen_dioxide != null ? `${cur.nitrogen_dioxide.toFixed(1)} µg/m³` : '—'}</b>
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------------- WIND ---------------- */

export function WindCard({
  forecast,
  units,
}: {
  forecast: Forecast
  units: UnitSystem
}) {
  const c = forecast.current
  const dir = c.wind_direction_10m
  const from = compass(dir)

  return (
    <section className="gauge-card glass-2 glass-card sheen lift reveal" aria-label="Wind">
      <div className="card-body gauge-card__inner">
        <span className="gauge-card__label">
          <Compass size={15} strokeWidth={2} /> Wind
        </span>

        <div className="wind-compass" aria-hidden="true">
          <span className="wind-compass__cardinal n">N</span>
          <span className="wind-compass__cardinal e">E</span>
          <span className="wind-compass__cardinal s">S</span>
          <span className="wind-compass__cardinal w">W</span>
          <span
            className="wind-compass__needle"
            style={{ transform: `rotate(${dir + 180}deg)` }}
          >
            <Navigation size={30} strokeWidth={1.6} fill="currentColor" />
          </span>
        </div>

        <span className="gauge-card__value" style={{ textAlign: 'center' }}>
          {fmtWind(c.wind_speed_10m, units)}
        </span>
        <span className="gauge-card__status" style={{ alignSelf: 'center' }}>
          from {from} · {windDescriptor(c.wind_speed_10m)}
        </span>

        <div className="gauge-card__rows">
          <span className="gauge-row">
            <span>Gusts today</span>
            <b>{fmtWind(forecast.daily.wind_speed_10m_max[0], units)}</b>
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------------- NEXT 6 HOURS RAIN ---------------- */

export function RainCard({
  forecast,
  nowIdx,
}: {
  forecast: Forecast
  nowIdx: number
}) {
  const h = forecast.hourly
  const end = Math.min(h.time.length, nowIdx + 6)
  const cols = []
  for (let i = nowIdx; i < end; i++) {
    const pct = h.precipitation_probability[i] ?? 0
    cols.push(
      <span className="rainbars__col" key={h.time[i]}>
        <span className="rainbars__bar" style={{ height: `${Math.max(4, (pct / 100) * 100)}%` }} />
        <span className="rainbars__label">{i === nowIdx ? 'Now' : formatHour(h.time[i]).replace(' ', '')}</span>
      </span>,
    )
  }

  const peak = Math.max(
    ...Array.from({ length: Math.max(0, end - nowIdx) }, (_, k) => h.precipitation_probability[nowIdx + k] ?? 0),
  )

  return (
    <section className="gauge-card glass-2 glass-card sheen lift reveal" aria-label="Precipitation next 6 hours">
      <div className="card-body gauge-card__inner">
        <span className="gauge-card__label">
          <Droplet size={15} strokeWidth={2} /> Rain next 6 hours
        </span>
        <span className="gauge-card__value">
          {peak}%
          <small>peak chance</small>
        </span>
        <div className="rainbars">{cols}</div>
        <div className="gauge-card__rows">
          <span className="gauge-row">
            <span>Outlook</span>
            <b>{peak >= 70 ? 'Rain very likely' : peak >= 40 ? 'Scattered showers' : 'Mostly dry'}</b>
          </span>
        </div>
      </div>
    </section>
  )
}
