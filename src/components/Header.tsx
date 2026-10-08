import { Loader2, Moon, Navigation, Sun } from 'lucide-react'
import SearchBar from './SearchBar'
import UnitSwitcher from './UnitSwitcher'
import ThemeToggle from './ThemeToggle'
import type { UnitSystem } from '../lib/units'
import type { Theme } from '../lib/storage'
import type { Place } from '../lib/api'

interface Props {
  units: UnitSystem
  onUnits: (u: UnitSystem) => void
  theme: Theme
  onTheme: () => void
  onPickPlace: (p: Place) => void
  onLocate: () => void
  locating: boolean
}

/** Floating glass navigation bar — logo, section links, search, unit + location + theme controls. */
export default function Header({
  units,
  onUnits,
  theme,
  onTheme,
  onPickPlace,
  onLocate,
  locating,
}: Props) {
  return (
    <header className="header">
      <div className="container">
        <div className="header__bar glass-4">
          <a className="brand" href="#top" aria-label="Aether weather home">
            <span className="brand__mark">
              {theme === 'dark' ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
            </span>
            <span>
              <span className="brand__name">Aether</span>
              <span className="brand__tag">Glass Weather</span>
            </span>
          </a>

          <nav className="header__nav" aria-label="Sections">
            <a href="#hourly">Hourly</a>
            <a href="#forecast">7-Day</a>
            <a href="#details">Details</a>
            <a href="#alerts">Alerts</a>
          </nav>

          <div className="header__spacer" />

          <SearchBar onSelect={onPickPlace} />

          <div className="header__actions">
            <UnitSwitcher units={units} onChange={onUnits} />
            <button
              type="button"
              className="glass-btn icon-only"
              onClick={onLocate}
              disabled={locating}
              aria-label="Use my current location"
              title="Current location"
            >
              {locating ? (
                <Loader2 size={18} strokeWidth={1.8} className="spin" />
              ) : (
                <Navigation size={18} strokeWidth={1.8} />
              )}
            </button>
            <ThemeToggle theme={theme} onToggle={onTheme} />
          </div>
        </div>
      </div>
    </header>
  )
}
