/** Open-Meteo API wrappers — geocoding, forecast, air quality. No API key needed. */

export interface Place {
  id?: number
  name: string
  admin1?: string
  country?: string
  country_code?: string
  latitude: number
  longitude: number
  timezone?: string
  /** Inhabitants — used to rank search results (big cities first). */
  population?: number
  /** True when derived from device geolocation rather than search. */
  current?: boolean
}

export interface CurrentWeather {
  time: string
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  precipitation: number
  weather_code: number
  wind_speed_10m: number
  wind_direction_10m: number
  surface_pressure: number
}

export interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  weather_code: number[]
  precipitation_probability: (number | null)[]
  is_day: number[]
  visibility: number[]
  dew_point_2m: number[]
}

export interface DailyWeather {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
  precipitation_probability_max: (number | null)[]
  wind_speed_10m_max: number[]
}

export interface Forecast {
  timezone: string
  timezone_abbreviation?: string
  current: CurrentWeather
  hourly: HourlyWeather
  daily: DailyWeather
}

export interface AirQuality {
  current: {
    time: string
    us_aqi: number | null
    pm2_5: number | null
    ozone: number | null
    nitrogen_dioxide: number | null
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return (await res.json()) as T
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&format=json&name=' +
    encodeURIComponent(query)
  const data = await getJson<{ results?: Place[] }>(url, signal)
  return data.results ?? []
}

export async function fetchForecast(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    timezone: 'auto',
    forecast_days: '7',
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure',
    hourly:
      'temperature_2m,weather_code,precipitation_probability,is_day,visibility,dew_point_2m',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max',
  })
  return getJson<Forecast>(`https://api.open-meteo.com/v1/forecast?${params}`, signal)
}

export async function fetchAirQuality(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    timezone: 'auto',
    current: 'us_aqi,pm2_5,ozone,nitrogen_dioxide',
  })
  return getJson<AirQuality>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
    signal,
  )
}
