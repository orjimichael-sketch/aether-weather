import type { UnitSystem } from '../lib/units'

interface Props {
  units: UnitSystem
  onChange: (u: UnitSystem) => void
}

/** Glass pill segmented control: °C ↔ °F, with a sliding glass thumb. */
export default function UnitSwitcher({ units, onChange }: Props) {
  const index = units === 'metric' ? 0 : 1
  return (
    <div className="glass-seg" data-index={index} role="group" aria-label="Temperature units">
      <span className="seg-thumb" aria-hidden="true" />
      <button
        type="button"
        aria-pressed={units === 'metric'}
        onClick={() => onChange('metric')}
      >
        °C
      </button>
      <button
        type="button"
        aria-pressed={units === 'imperial'}
        onClick={() => onChange('imperial')}
      >
        °F
      </button>
    </div>
  )
}
