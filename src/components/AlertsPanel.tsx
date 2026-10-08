import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { WeatherAlert } from '../lib/alerts'

interface Props {
  alerts: WeatherAlert[]
}

/** Advisory cards: subtle condition-tinted glow instead of solid colour blocks. */
export default function AlertsPanel({ alerts }: Props) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div>
      {alerts.map((a, i) => {
        const isOpen = open === a.id
        return (
          <article
            key={a.id}
            className={`alert-card glass-2 lift reveal alert-card--${a.severity}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="alert-card__icon">
              <a.icon size={21} strokeWidth={1.8} />
            </span>

            <div className="alert-card__body">
              <h3 className="alert-card__title">
                {a.title}
                <span className="alert-card__badge">{a.badge}</span>
              </h3>
              <p className="alert-card__text">{a.text}</p>

              {isOpen && <p className="alert-card__details">{a.details}</p>}

              <button
                type="button"
                className="glass-btn compact alert-card__action"
                onClick={() => setOpen(isOpen ? null : a.id)}
                aria-expanded={isOpen}
              >
                {isOpen ? 'Hide details' : 'View details'}
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 240ms cubic-bezier(.22,.61,.36,1)',
                  }}
                />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
