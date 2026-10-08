import { useEffect, useId, useRef, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'
import { searchPlaces, type Place } from '../lib/api'

interface Props {
  onSelect: (place: Place) => void
}

const isApple = /Mac|iPhone|iPad/.test(navigator.platform ?? '')

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  /* Global ⌘K / Ctrl+K focus */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Debounced geocoding */
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const found = await searchPlaces(q, controller.signal)
        const needle = q.toLowerCase()
        const ranked = [...found].sort((a, b) => {
          const exact =
            Number(b.name.toLowerCase() === needle) - Number(a.name.toLowerCase() === needle)
          if (exact !== 0) return exact
          return (b.population ?? 0) - (a.population ?? 0)
        })
        setResults(ranked)
        setCursor(ranked.length ? 0 : -1)
        setOpen(true)
      } catch {
        /* aborted or offline — keep previous results */
      } finally {
        setLoading(false)
      }
    }, 260)
    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [query])

  /* Close when clicking outside */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el.closest?.('.search')) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const choose = (place: Place) => {
    onSelect(place)
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % results.length)
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c - 1 + results.length) % results.length)
    }
    if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault()
      choose(results[cursor])
    }
  }

  const showPanel = open && (loading || results.length > 0 || query.trim().length >= 2)

  return (
    <div className="search">
      <div className="search__field">
        <Search className="search__icon" size={18} strokeWidth={2} />
        <input
          ref={inputRef}
          className="glass-input search__input"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Search city, country or location"
          placeholder="Search city, country or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <span className="search__kbd">{isApple ? '⌘ K' : 'Ctrl K'}</span>
      </div>

      {showPanel && (
        <div className="search__results glass-4" id={listId} role="listbox" aria-label="Search results">
          {loading && results.length === 0 && (
            <div className="search__hint" role="presentation">
              <Loader2 size={14} className="spin" style={{ verticalAlign: '-2px', marginRight: 8 }} />
              Searching places…
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="search__hint" role="presentation">
              No places match “{query.trim()}”. Try a city or region name.
            </div>
          )}

          {results.map((place, i) => {
            const meta = [place.admin1, place.country].filter(Boolean).join(', ')
            return (
              <button
                key={`${place.id ?? place.latitude}-${place.longitude}`}
                type="button"
                role="option"
                aria-selected={i === cursor}
                className={`search__row${i === cursor ? ' is-cursor' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => choose(place)}
              >
                <span className="search__row-icon">
                  <MapPin size={16} strokeWidth={2} />
                </span>
                <span className="search__row-body">
                  <span className="search__row-name">{place.name}</span>
                  {meta && <span className="search__row-meta">{meta}</span>}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
