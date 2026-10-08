import type { Scene } from '../lib/weather'

interface Props {
  scene: Scene
  isDay: boolean
}

/**
 * Full-screen atmospheric backdrop.
 * Layered: gradient scene → colour blobs → sun/moon orb → stars → rain → snow → lightning.
 * All motion is CSS-driven (GPU transforms) and respects prefers-reduced-motion.
 */
export default function Atmosphere({ scene, isDay }: Props) {
  const rain = scene === 'rain' || scene === 'thunder'
  const snow = scene === 'snow'
  const storm = scene === 'thunder'
  const stars = !isDay || scene === 'snow'
  const sun = isDay && scene !== 'night'

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__scene" />

      <div className="atmosphere__blob atmosphere__blob--a" />
      <div className="atmosphere__blob atmosphere__blob--b" />

      <div className={`atmosphere__orb ${sun ? 'atmosphere__orb--sun' : 'atmosphere__orb--moon'}`} />

      <div className={`atmosphere__stars${stars ? ' is-on' : ''}`} />

      <div className={`atmosphere__rain${rain ? ' is-on' : ''}`}>
        <span />
        <span />
        <span />
      </div>

      <div className={`atmosphere__snow${snow ? ' is-on' : ''}`}>
        <span />
        <span />
        <span />
      </div>

      <div className={`atmosphere__lightning${storm ? ' is-on' : ''}`} />

      <div className="atmosphere__vignette" />
    </div>
  )
}
