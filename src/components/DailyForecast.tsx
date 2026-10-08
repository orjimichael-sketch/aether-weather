import { Droplet } from 'lucide-react'
import type { Forecast } from '../lib/api'
import type { UnitSystem } from '../lib/units'
import { temp } from '../lib/units'
import { describe, iconFor } from '../lib/weather'
import { dateShort, weekdayShort } from '../lib/time'

interface Props {
  forecast: Forecast
  units: UnitSystem
}

/** 7-day forecast: horizontal glass cards with a shared high/low range bar. */
export default function DailyForecast({ forecast, units }: Props) {
  const d = forecast.daily
  const globalMin = Math.min(...d.temperature_2m_min)
  const globalMax = Math.max(...d.temperature_2m_max)
  const span = Math.max(globalMax - globalMin, 1)

  return (
    <div className="daily-rail glass-scroll" role="list">
      {d.time.map((day, i) => {
        const isDay = i === 0 ? forecast.current.is_day === 1 : true
        const Icon = iconFor(d.weather_code[i], isDay)
        const cond = describe(d.weather_code[i])
        const hi = temp(d.temperature_2m_max[i], units)
        const lo = temp(d.temperature_2m_min[i], units)
        const rain = d.precipitation_probability_max[i] ?? 0
        const left = ((d.temperature_2m_min[i] - globalMin) / span) * 100
        const width = ((d.temperature_2m_max[i] - d.temperature_2m_min[i]) / span) * 100

        return (
          <article
            key={day}
            className="day-card glass-1 lift"
            role="listitem"
            aria-label={`${weekdayShort(day)}, ${cond.label}, high ${hi}, low ${lo}`}
          >
            <div className="day-card__top">
              <span className="day-card__name">{i === 0 ? 'Today' : weekdayShort(day)}</span>
              <span className="day-card__date">{dateShort(day)}</span>
            </div>

            <Icon className="day-card__icon" size={34} strokeWidth={1.3} aria-hidden="true" />

            <div className="day-card__cond">{cond.label}</div>

            <div className="day-card__temps">
              <span className="day-card__hi">{hi}°</span>
              <span className="day-card__lo">{lo}°</span>
            </div>

            <div className="day-card__bar" aria-hidden="true">
              <i style={{ left: `${left}%`, width: `${Math.max(width, 6)}%` }} />
            </div>

            <span className="day-card__rain">
              <Droplet size={12} strokeWidth={2.4} />
              {rain}% chance
            </span>
          </article>
        )
      })}
    </div>
  )
}
