import { useMemo, useState } from 'react'
import { ChartLine, CloudRain } from 'lucide-react'
import type { Forecast } from '../lib/api'
import type { UnitSystem } from '../lib/units'
import { tempRaw, tempUnit } from '../lib/units'
import { formatHour } from '../lib/time'
import { useElementWidth } from '../hooks/useElementWidth'

interface Props {
  forecast: Forecast
  units: UnitSystem
  nowIdx: number
}

type Mode = 'temp' | 'rain'

const HOURS = 24
const PAD = { l: 40, r: 18, t: 26, b: 30 }

/** Smooth cubic path through points (midpoint control points). */
function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return ''
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return d
}

/** Glass-panelled 24h chart: temperature curve or precipitation bars. */
export default function TemperatureChart({ forecast, units, nowIdx }: Props) {
  const [mode, setMode] = useState<Mode>('temp')
  const [hover, setHover] = useState<number | null>(null)
  const { ref, width } = useElementWidth<HTMLDivElement>()

  const h = forecast.hourly
  const end = Math.min(h.time.length, nowIdx + HOURS)
  const idx = useMemo(
    () => Array.from({ length: Math.max(0, end - nowIdx) }, (_, k) => nowIdx + k),
    [nowIdx, end],
  )

  const height = width < 560 ? 210 : 260
  const w = Math.max(width, 320)
  const innerW = w - PAD.l - PAD.r
  const innerH = height - PAD.t - PAD.b

  const temps = idx.map((i) => tempRaw(h.temperature_2m[i], units))
  const rains = idx.map((i) => h.precipitation_probability[i] ?? 0)
  const min = Math.min(...temps)
  const max = Math.max(...temps)
  const span = Math.max(max - min, 2)

  const xAt = (k: number) =>
    PAD.l + (idx.length <= 1 ? innerW / 2 : (k / (idx.length - 1)) * innerW)
  const yAt = (t: number) => PAD.t + innerH - ((t - min) / span) * innerH

  const pts: [number, number][] = temps.map((t, k) => [xAt(k), yAt(t)])
  const linePath = smoothPath(pts)
  const areaPath =
    pts.length > 0
      ? `${linePath} L ${pts[pts.length - 1][0]},${PAD.t + innerH} L ${pts[0][0]},${PAD.t + innerH} Z`
      : ''

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * w
    const rel = (x - PAD.l) / (innerW || 1)
    const k = Math.round(rel * (idx.length - 1))
    setHover(k >= 0 && k < idx.length ? k : null)
  }

  const tickEvery = width < 560 ? 6 : 3
  const yTicks = [max, (max + min) / 2, min]
  const gradId = mode === 'temp' ? 'chartAreaTemp' : 'chartAreaRain'

  const hoveredIdx = hover != null ? idx[hover] : null

  return (
    <section className="glass-2 glass-card chart-card lift reveal" aria-label="Temperature trend">
      <div className="chart-card__head">
        <h2 className="chart-card__title">
          <ChartLine size={17} strokeWidth={2} />
          Next 24 hours
        </h2>
        <div className="glass-seg" data-index={mode === 'temp' ? 0 : 1} role="group" aria-label="Chart series">
          <span className="seg-thumb" aria-hidden="true" />
          <button type="button" aria-pressed={mode === 'temp'} onClick={() => setMode('temp')}>
            Temperature
          </button>
          <button type="button" aria-pressed={mode === 'rain'} onClick={() => setMode('rain')}>
            <CloudRain size={13} strokeWidth={2} style={{ verticalAlign: -2, marginRight: 5 }} />
            Rain %
          </button>
        </div>
      </div>

      <div className="chart-wrap" ref={ref}>
        {idx.length > 0 && width > 0 && (
          <>
            <svg
              viewBox={`0 0 ${w} ${height}`}
              height={height}
              role="img"
              aria-label={
                mode === 'temp'
                  ? `Temperature over the next 24 hours, ${Math.round(min)} to ${Math.round(max)} ${tempUnit(units)}`
                  : 'Precipitation probability over the next 24 hours'
              }
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            >
              <defs>
                <linearGradient id="chartAreaTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: 'var(--accent-2)', stopOpacity: 0.4 }} />
                  <stop offset="100%" style={{ stopColor: 'var(--accent-2)', stopOpacity: 0 }} />
                </linearGradient>
                <linearGradient id="chartAreaRain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: '#7dd3fc', stopOpacity: 0.9 }} />
                  <stop offset="100%" style={{ stopColor: '#38bdf8', stopOpacity: 0.2 }} />
                </linearGradient>
              </defs>

              {/* horizontal guides */}
              {yTicks.map((t, i) => (
                <line
                  key={i}
                  x1={PAD.l}
                  x2={w - PAD.r}
                  y1={yAt(t)}
                  y2={yAt(t)}
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="3 7"
                />
              ))}

              {yTicks.map((t, i) => (
                <text
                  key={`y${i}`}
                  x={PAD.l - 10}
                  y={yAt(t) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--ink-3)"
                >
                  {Math.round(t)}°
                </text>
              ))}

              {mode === 'temp' ? (
                <>
                  <path d={areaPath} fill={`url(#${gradId})`} />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="var(--accent-2)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px var(--scene-glow))' }}
                  />
                  {/* now marker */}
                  <circle cx={pts[0][0]} cy={pts[0][1]} r="5.5" fill="var(--accent)" />
                  <circle
                    cx={pts[0][0]}
                    cy={pts[0][1]}
                    r="10"
                    fill="none"
                    stroke="var(--accent)"
                    strokeOpacity="0.4"
                  />
                </>
              ) : (
                idx.map((i, k) => {
                  const barW = Math.max(6, (innerW / idx.length) * 0.55)
                  const pct = rains[k] / 100
                  const bh = Math.max(pct * innerH, pct > 0 ? 4 : 1.5)
                  return (
                    <rect
                      key={i}
                      x={xAt(k) - barW / 2}
                      y={PAD.t + innerH - bh}
                      width={barW}
                      height={bh}
                      rx={barW / 2.4}
                      fill={`url(#${gradId})`}
                      opacity={rains[k] > 0 ? 1 : 0.35}
                    />
                  )
                })
              )}

              {/* x labels */}
              {idx.map((i, k) =>
                k % tickEvery === 0 || k === idx.length - 1 ? (
                  <text
                    key={`x${i}`}
                    x={xAt(k)}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fill={k === 0 ? 'var(--accent)' : 'var(--ink-3)'}
                    fontWeight={k === 0 ? 700 : 400}
                  >
                    {k === 0 ? 'Now' : formatHour(h.time[i]).replace(' ', '')}
                  </text>
                ) : null,
              )}

              {/* hover guide */}
              {hover != null && pts[hover] && mode === 'temp' && (
                <line
                  x1={pts[hover][0]}
                  x2={pts[hover][0]}
                  y1={PAD.t}
                  y2={PAD.t + innerH}
                  stroke="rgba(255,255,255,0.28)"
                  strokeDasharray="4 5"
                />
              )}
            </svg>

            {hoveredIdx != null && hover != null && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${(xAt(hover) / w) * 100}%`,
                  top:
                    mode === 'temp'
                      ? `${(yAt(temps[hover]) / height) * 100}%`
                      : `${((PAD.t + innerH - Math.max((rains[hover] / 100) * innerH, 4)) / height) * 100}%`,
                }}
              >
                <b>
                  {mode === 'temp'
                    ? `${temps[hover]}${tempUnit(units)}`
                    : `${rains[hover]}%`}
                </b>
                <span>
                  {formatHour(h.time[hoveredIdx])} · {mode === 'temp' ? `rain ${rains[hover]}%` : 'precip probability'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
