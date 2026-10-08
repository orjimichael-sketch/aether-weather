import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Clock,
  LayoutGrid,
  Radar,
} from 'lucide-react'

import Atmosphere from './components/Atmosphere'
import Header from './components/Header'
import FavoritesStrip from './components/FavoritesStrip'
import CurrentWeather from './components/CurrentWeather'
import HourlyForecast from './components/HourlyForecast'
import TemperatureChart from './components/TemperatureChart'
import DailyForecast from './components/DailyForecast'
import StatsGrid from './components/StatsGrid'
import SunCard from './components/SunCard'
import { AirQualityCard, RainCard, UVCard, WindCard } from './components/Panels'
import AlertsPanel from './components/AlertsPanel'
import { ErrorState, LoadingState } from './components/States'

import {
  fetchAirQuality,
  fetchForecast,
  searchPlaces,
  type AirQuality,
  type Forecast,
  type Place,
} from './lib/api'
import { deriveAlerts } from './lib/alerts'
import { sceneFor } from './lib/weather'
import { minuteOfDay, nowIndex } from './lib/time'
import type { UnitSystem } from './lib/units'
import {
  DEFAULT_PLACE,
  loadFavorites,
  loadPlace,
  loadTheme,
  loadUnits,
  saveFavorites,
  savePlace,
  saveTheme,
  saveUnits,
  type Theme,
} from './lib/storage'

const samePlace = (a: Place, b: Place) =>
  Math.abs(a.latitude - b.latitude) < 0.02 && Math.abs(a.longitude - b.longitude) < 0.02

export default function App() {
  /* ---------------- persistent UI state ---------------- */
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [units, setUnits] = useState<UnitSystem>(loadUnits)
  const [favorites, setFavorites] = useState<Place[]>(loadFavorites)
  const [place, setPlace] = useState<Place>(() => loadPlace() ?? DEFAULT_PLACE)

  /* ---------------- data state ---------------- */
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [air, setAir] = useState<AirQuality | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [fetchedAt, setFetchedAt] = useState(() => Date.now())
  const [locating, setLocating] = useState(false)
  const [notice, setNotice] = useState('')

  /* live clock (drives sun position + "now" hour without refetching) */
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  /* ---------------- fetch ---------------- */
  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    if (forecast) setRefreshing(true)
    else setStatus('loading')

    ;(async () => {
      try {
        const [fc, aq] = await Promise.all([
          fetchForecast(place.latitude, place.longitude, controller.signal),
          fetchAirQuality(place.latitude, place.longitude, controller.signal).catch(() => null),
        ])
        if (!alive) return
        setForecast(fc)
        setAir(aq)
        setFetchedAt(Date.now())
        setStatus('ready')
        setError('')
      } catch (err) {
        if (!alive) return
        if (forecast) {
          setNotice('Refresh failed — showing the last loaded forecast.')
        } else {
          setError(err instanceof Error ? err.message : 'Unknown network error')
          setStatus('error')
        }
      } finally {
        if (alive) setRefreshing(false)
      }
    })()

    return () => {
      alive = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place, reloadKey])

  /* ---------------- document attributes ---------------- */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveTheme(theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#050816' : '#dce8f7')
  }, [theme])

  useEffect(() => {
    saveUnits(units)
  }, [units])

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 5000)
    return () => clearTimeout(id)
  }, [notice])

  /* ---------------- derived ---------------- */
  const scene = forecast
    ? sceneFor(forecast.current.weather_code, forecast.current.is_day === 1)
    : 'sunny'

  useEffect(() => {
    document.documentElement.setAttribute('data-scene', scene)
  }, [scene])

  /** Wall-clock "now" at the forecast location (advances with the session clock). */
  const wallNowIso = useMemo(() => {
    if (!forecast) return ''
    const base = Date.parse(`${forecast.current.time}Z`)
    if (Number.isNaN(base)) return forecast.current.time
    return new Date(base + Math.max(0, nowMs - fetchedAt)).toISOString()
  }, [forecast, nowMs, fetchedAt])

  const nowMinutes = forecast ? minuteOfDay(wallNowIso || forecast.current.time) : 0
  const nowIdx = forecast
    ? nowIndex(forecast.hourly.time, wallNowIso || forecast.current.time)
    : 0

  const uv = forecast?.daily.uv_index_max[0] ?? 0
  const visibilityM = forecast?.hourly.visibility[nowIdx] ?? 10000
  const alerts = useMemo(() => (forecast ? deriveAlerts(forecast) : []), [forecast])
  const isFavorite = favorites.some((f) => samePlace(f, place))

  /* ---------------- handlers ---------------- */
  const pickPlace = useCallback((p: Place) => {
    setPlace(p)
    savePlace(p)
  }, [])

  const toggleFavorite = useCallback(() => {
    setFavorites((prev) => {
      const exists = prev.some((f) => samePlace(f, place))
      if (exists) return prev.filter((f) => !samePlace(f, place))
      return [
        ...prev,
        {
          name: place.name,
          admin1: place.admin1,
          country: place.country,
          country_code: place.country_code,
          latitude: place.latitude,
          longitude: place.longitude,
        },
      ]
    })
  }, [place])

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setNotice('Geolocation is not supported by this browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        let tz = ''
        try {
          tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
        } catch {
          /* older engines */
        }
        const guess = tz.split('/').pop()?.replace(/_/g, ' ') || 'Current location'
        let next: Place = { name: guess, latitude, longitude, timezone: tz, current: true }
        try {
          const found = await searchPlaces(guess)
          const hit = found[0]
          if (hit) {
            next = {
              name: hit.name,
              admin1: hit.admin1,
              country: hit.country,
              country_code: hit.country_code,
              latitude,
              longitude,
              timezone: tz,
              current: true,
            }
          }
        } catch {
          /* enrichment is optional */
        }
        setLocating(false)
        pickPlace(next)
      },
      (err) => {
        setLocating(false)
        setNotice(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — search for a city instead.'
            : 'Could not determine your location.',
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300_000 },
    )
  }, [pickPlace])

  const retry = useCallback(() => setReloadKey((k) => k + 1), [])

  /* ---------------- render ---------------- */
  const ready = status === 'ready' && forecast

  return (
    <>
      <Atmosphere scene={scene} isDay={forecast ? forecast.current.is_day === 1 : true} />

      <div className="app" id="top">
        <a className="skip-link glass-pill" href="#main">
          Skip to content
        </a>

        <Header
          units={units}
          onUnits={setUnits}
          theme={theme}
          onTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onPickPlace={pickPlace}
          onLocate={locate}
          locating={locating}
        />

        <main className="container" id="main">
          <FavoritesStrip
            favorites={favorites}
            active={place}
            onSelect={pickPlace}
          />

          {status === 'loading' && !forecast && <LoadingState />}

          {status === 'error' && !forecast && <ErrorState message={error} onRetry={retry} />}

          {ready && forecast && (
            <>
              <div className="section" style={{ marginTop: 22 }}>
                <CurrentWeather
                  place={place}
                  forecast={forecast}
                  units={units}
                  uv={uv}
                  visibilityM={visibilityM}
                  nowMinutes={nowMinutes}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  onRefresh={retry}
                  refreshing={refreshing}
                />
              </div>

              <section className="section" id="hourly" aria-labelledby="h-hourly">
                <div className="section__head">
                  <h2 className="section__title" id="h-hourly">
                    <Clock size={14} strokeWidth={2.2} /> Hourly forecast
                  </h2>
                  <span className="section__note">Next 24 hours · scroll horizontally</span>
                </div>
                <HourlyForecast forecast={forecast} units={units} nowIdx={nowIdx} />
              </section>

              <section className="section" aria-label="Temperature trend">
                <TemperatureChart forecast={forecast} units={units} nowIdx={nowIdx} />
              </section>

              <section className="section" id="forecast" aria-labelledby="h-forecast">
                <div className="section__head">
                  <h2 className="section__title" id="h-forecast">
                    <CalendarDays size={14} strokeWidth={2.2} /> 7-day forecast
                  </h2>
                  <span className="section__note">High / low range across the week</span>
                </div>
                <DailyForecast forecast={forecast} units={units} />
              </section>

              <section className="section" id="details" aria-labelledby="h-details">
                <div className="section__head">
                  <h2 className="section__title" id="h-details">
                    <LayoutGrid size={14} strokeWidth={2.2} /> Conditions
                  </h2>
                  <span className="section__note">Live observations</span>
                </div>
                <StatsGrid forecast={forecast} units={units} nowIdx={nowIdx} />
              </section>

              <section className="section" aria-label="Sun, UV and air quality">
                <div className="grid grid--trio">
                  <SunCard forecast={forecast} nowMinutes={nowMinutes} />
                  <UVCard uv={uv} />
                  <AirQualityCard air={air} />
                </div>
              </section>

              <section className="section" aria-label="Wind and precipitation">
                <div className="grid grid--pair">
                  <WindCard forecast={forecast} units={units} />
                  <RainCard forecast={forecast} nowIdx={nowIdx} />
                </div>
              </section>

              <section className="section" id="alerts" aria-labelledby="h-alerts">
                <div className="section__head">
                  <h2 className="section__title" id="h-alerts">
                    <AlertTriangle size={14} strokeWidth={2.2} /> Advisories
                  </h2>
                  <span className="section__note">Derived from live forecast thresholds</span>
                </div>
                <AlertsPanel alerts={alerts} />
              </section>
            </>
          )}

          <footer className="footer glass-1">
            <span>
              <Radar size={14} strokeWidth={2} style={{ verticalAlign: -2, marginRight: 8, color: 'var(--accent)' }} />
              Weather &amp; air-quality data by{' '}
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer">
                Open-Meteo
              </a>{' '}
              · No API key required
            </span>
            <span>
              <BarChart3 size={14} strokeWidth={2} style={{ verticalAlign: -2, marginRight: 8, color: 'var(--accent)' }} />
              {units === 'metric' ? 'Metric · °C, km/h' : 'Imperial · °F, mph'} ·{' '}
              {theme === 'dark' ? 'Dark atmosphere' : 'Light atmosphere'}
            </span>
          </footer>
        </main>
      </div>

      {notice && (
        <div className="toast glass-4" role="status">
          {notice}
        </div>
      )}
    </>
  )
}
