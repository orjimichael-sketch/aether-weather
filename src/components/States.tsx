import { CloudOff, Loader2, RefreshCw, WifiOff } from 'lucide-react'
import { CurrentSkeleton } from './CurrentWeather'

/** First-load skeleton — glass placeholders for the main layout. */
export function LoadingState() {
  return (
    <div className="loading-rows" aria-busy="true" aria-live="polite">
      <span className="visually-hidden" style={{ position: 'absolute', left: -9999 }}>
        Loading forecast…
      </span>
      <CurrentSkeleton />
      <div className="grid grid--stats">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="stat-card glass-1">
            <span className="skeleton" style={{ width: 46, height: 46, borderRadius: 16 }} />
            <span style={{ flex: 1 }}>
              <span className="skeleton" style={{ display: 'block', height: 12, width: '55%' }} />
              <span
                className="skeleton"
                style={{ display: 'block', height: 26, width: '40%', marginTop: 8 }}
              />
            </span>
          </div>
        ))}
      </div>
      <div className="glass-2 glass-card state-panel">
        <Loader2 className="state-panel__icon spin" size={30} strokeWidth={1.6} />
        <p className="state-panel__text">Gathering atmospheric data…</p>
      </div>
    </div>
  )
}

/** Friendly glass error panel with retry. */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  const Icon = offline ? WifiOff : CloudOff
  return (
    <div className="glass-3 glass-card state-panel reveal">
      <Icon className="state-panel__icon" size={36} strokeWidth={1.4} />
      <h2 className="state-panel__title">
        {offline ? 'You appear to be offline' : "Couldn't load the forecast"}
      </h2>
      <p className="state-panel__text">
        {offline
          ? 'Reconnect to the internet and we’ll pull fresh atmospheric data for this location.'
          : message}
      </p>
      <button type="button" className="glass-btn primary" onClick={onRetry}>
        <RefreshCw size={16} strokeWidth={1.9} />
        Retry
      </button>
    </div>
  )
}
