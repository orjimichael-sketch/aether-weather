import { Droplet } from 'lucide-react'
import type { Forecast } from '../lib/api'
import type { UnitSystem } from '../lib/units'
import { temp } from '../lib/units'
import { iconFor } from '../lib/weather'
import { formatHour } from '../lib/time'

interface Props {
  forecast: Forecast
  units: UnitSystem
  nowIdx: number
}

/** Rail of small glass cards — one per hour for the next 24 hours. */
export default function HourlyForecast({ forecast, units, nowIdx }: Props) {
  const h = forecast.hourly
  const end = Math.min(h.time.length, nowIdx + 24)

  const hours = []
  for (let i = nowIdx; i < end; i++) {
    const isNow = i === nowIdx
    const Icon = iconFor(h.weather_code[i], h.is_day[i] === 1)
    const rain = h.precipitation_probability[i] ?? 0
    hours.push(
      <article
        key={h.time[i]}
        className={`hour-card glass-1 lift${isNow ? ' is-now' : ''}`}
        role="listitem"
        aria-label={`${isNow ? 'Now' : formatHour(h.time[i])}, ${temp(h.temperature_2m[i], units)} degrees, ${rain}% chance of rain`}
      >
        <span className="hour-card__time">{isNow ? 'Now' : formatHour(h.time[i])}</span>
        <Icon className="hour-card__icon" size={30} strokeWidth={1.4} aria-hidden="true" />
        <span className="hour-card__temp">{temp(h.temperature_2m[i], units)}°</span>
        <span className="hour-card__rain">
          <Droplet size={11} strokeWidth={2.4} />
          {rain}%
        </span>
      </article>,
    )
  }

  return (
    <div className="hourly-rail glass-scroll" role="list">
      {hours}
    </div>
  )
}
