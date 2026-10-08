import { Heart } from 'lucide-react'
import type { Place } from '../lib/api'

interface Props {
  favorites: Place[]
  active: Place
  onSelect: (p: Place) => void
}

const samePlace = (a: Place, b: Place) =>
  Math.abs(a.latitude - b.latitude) < 0.02 && Math.abs(a.longitude - b.longitude) < 0.02

/** Horizontal strip of glass pills for saved locations. */
export default function FavoritesStrip({ favorites, active, onSelect }: Props) {
  if (favorites.length === 0) return null

  return (
    <div className="favorites glass-scroll" aria-label="Favorite locations">
      <span className="favorites__label">
        <Heart size={13} strokeWidth={2} /> Favorites
      </span>
      {favorites.map((f) => {
        const isActive = samePlace(f, active)
        return (
          <button
            key={`${f.latitude}-${f.longitude}`}
            type="button"
            className={`glass-pill fav-pill${isActive ? ' is-active' : ''}`}
            onClick={() => onSelect(f)}
            aria-current={isActive ? 'true' : undefined}
            title={
              isActive
                ? 'Currently viewing — press the heart on the weather card to remove'
                : `View ${f.name}`
            }
          >
            <Heart
              size={14}
              strokeWidth={2}
              className="heart-on"
              fill={isActive ? 'currentColor' : 'none'}
            />
            {f.name}
            <span className="fav-pill__sep" aria-hidden="true" />
            <span className="fav-pill__meta">
              {[f.admin1, f.country].filter(Boolean).join(' · ') || 'Saved'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
