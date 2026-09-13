import { Volume2, VolumeX } from 'lucide-react'

type HeaderProps = {
  soundEnabled: boolean
  onToggleSound: () => void
  onHelp: () => void
}

export function Header({ soundEnabled, onToggleSound, onHelp }: HeaderProps) {
  const soundLabel = soundEnabled ? 'Mute sound' : 'Enable sound'
  return (
    <header className="site-header">
      <a className="brand" href="./" aria-label="Triangulation Maze home">
        <h1>triangulation maze</h1>
      </a>
      <div className="header-actions">
        <button className="text-button help-button" onClick={onHelp}>
          How to play
        </button>
        <button
          className={`sound-button ${soundEnabled ? 'sound-on' : ''}`}
          onClick={onToggleSound}
          aria-label={soundLabel}
          aria-pressed={soundEnabled}
          title={soundLabel}
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          <span>Sound {soundEnabled ? 'on' : 'off'}</span>
        </button>
      </div>
    </header>
  )
}
