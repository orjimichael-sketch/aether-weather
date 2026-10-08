import { Sunrise } from 'lucide-react'
import type { Forecast } from '../lib/api'
import { formatClock, minuteOfDay, minutesToClock } from '../lib/time'

interface Props {
  forecast: Forecast
  /** Live local minute-of-day at the forecast location (ticks every minute). */
  nowMinutes: number
}

const W = 320
const H = 132
const X0 = 16
const X1 = W - 16
const BASE = 104
const CTRL_Y = -86 // quadratic control — puts the arc apex near the top

/** Point on the sky arc for progress t ∈ [0,1] (quadratic Bézier). */
function arcPoint(t: number): [number, number] {
  const cX = (X0 + X1) / 2
  const mt = 1 - t
  const x = mt * mt * X0 + 2 * mt * t * cX + t * t * X1
  const y = mt * mt * BASE + 2 * mt * t * CTRL_Y + t * t * BASE
  return [x, y]
}

/** Sunrise / sunset panel: glass arc with a glowing sun (or moon) orb at the live time. */
export default function SunCard({ forecast, nowMinutes }: Props) {
  const d = forecast.daily
  const sunriseIso = d.sunrise[0]
  const sunsetIso = d.sunset[0]

  const rise = minuteOfDay(sunriseIso)
  const set = minuteOfDay(sunsetIso)
  const local = nowMinutes

  const isDay = local >= rise && local < set
  const raw = isDay ? (local - rise) / Math.max(set - rise, 1) : local < rise ? 0 : 1
  const t = Math.min(1, Math.max(0, raw))
  const [orbX, orbY] = arcPoint(t)

  const dayLength = Math.max(0, set - rise)
  const remaining = Math.max(0, set - local)
  const hrs = Math.floor(dayLength / 60)
  const mins = Math.round(dayLength % 60)

  const phase = isDay
    ? remaining >= 60
      ? `${Math.floor(remaining / 60)}h ${Math.round(remaining % 60)}m until sunset`
      : `${Math.max(1, Math.round(remaining))}m until sunset`
    : local < rise
      ? `Sunrise at ${formatClock(sunriseIso)}`
      : 'Night — the sun is down'

  const arcD = `M ${X0},${BASE} Q ${(X0 + X1) / 2},${CTRL_Y} ${X1},${BASE}`

  return (
    <section className="suncard glass-2 glass-card sheen lift reveal" aria-label="Sunrise and sunset">
      <div className="card-body">
        <div className="suncard__head">
          <h2 className="suncard__title">
            <Sunrise size={17} strokeWidth={2} /> Sun path
          </h2>
          <span className="suncard__phase">{isDay ? 'Daylight' : 'Night'}</span>
        </div>

        <svg className="sun-arc-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={phase}>
          <defs>
            <linearGradient id="sunArcFade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.15" />
              <stop offset="50%" stopColor="var(--accent-2)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* horizon */}
          <line x1={X0} x2={X1} y1={BASE} y2={BASE} stroke="rgba(255,255,255,0.18)" strokeDasharray="2 6" />

          {/* full arc (dashed) + travelled portion */}
          <path d={arcD} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeDasharray="4 7" />
          {isDay && (
            <path
              d={arcD}
              fill="none"
              stroke="url(#sunArcFade)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ strokeDasharray: 1000, strokeDashoffset: 1000 - 1000 * t }}
            />
          )}

          {/* glowing orb */}
          <circle
            cx={orbX}
            cy={orbY}
            r="11"
            fill={isDay ? '#fde68a' : '#dbeafe'}
            className={isDay ? 'sun-orb' : 'sun-orb--moon'}
          />
          <circle cx={orbX} cy={orbY} r="4.5" fill={isDay ? '#fffbeb' : '#f8fafc'} opacity="0.95" />
        </svg>

        <div className="suncard__times">
          <span>
            Sunrise <b>{formatClock(sunriseIso)}</b>
          </span>
          <span style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: '0.74rem' }}>
            Day length{' '}
            <b style={{ fontSize: '0.92rem' }}>
              {hrs}h {mins}m
            </b>
          </span>
          <span>
            Sunset <b>{formatClock(sunsetIso)}</b>
          </span>
        </div>

        <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'var(--ink-3)', textAlign: 'center' }}>
          {phase} · local time {minutesToClock(local)}
        </p>
      </div>
    </section>
  )
}
