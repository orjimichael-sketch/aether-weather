import { useEffect, useRef, useState } from 'react'

/** Observes an element's content width (responsive SVG charts). */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev))
    })
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  return { ref, width }
}
