import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../lib/storage'

interface Props {
  theme: Theme
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: Props) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className="glass-btn icon-only"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
    </button>
  )
}
