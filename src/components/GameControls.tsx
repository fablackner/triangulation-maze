import type { CSSProperties } from 'react'
import { Check, Minus, Plus, RotateCcw, Undo2 } from 'lucide-react'
import { MAX_SIDES, MIN_SIDES } from '../game/model.ts'

type GameControlsProps = {
  sides: number
  puzzleSides: number
  moves: number
  matches: number
  solved: boolean
  onSidesChange: (sides: number) => void
  onNewPuzzle: () => void
  onUndo: () => void
  onReset: () => void
}

const legend = [
  { state: 'original', label: 'Original', description: 'Always flippable' },
  { state: 'available', label: 'Available', description: 'Can flip' },
  { state: 'locked', label: 'Locked', description: 'Cannot flip' },
  { state: 'target', label: 'Target', description: 'Match these' },
]

export function GameControls({
  sides,
  puzzleSides,
  moves,
  matches,
  solved,
  onSidesChange,
  onNewPuzzle,
  onUndo,
  onReset,
}: GameControlsProps) {
  const total = puzzleSides - 3
  return (
    <aside className="control-panel" aria-label="Game controls and progress">
      <section className="session-card">
        <div className="score-row">
          <span className="stat-label">Moves</span>
          <span className="move-count" data-testid="move-count">
            {moves}
          </span>
        </div>
        <div className="progress-label">
          <span>Matched</span>
          <span data-testid="match-count">
            {matches} / {total}
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Target alignment"
          aria-valuenow={matches}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={i < matches ? 'is-filled' : ''} />
          ))}
        </div>
        {solved && (
          <p className="solved-label" data-testid="win-message">
            Solved.
          </p>
        )}
        <div className="session-actions">
          <button className="secondary-button" onClick={onUndo} disabled={!moves}>
            <Undo2 size={14} /> Undo
          </button>
          <button className="secondary-button" onClick={onReset} disabled={!moves}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="vertex-label">
          <label htmlFor="vertices">Polygon vertices</label>
        </div>
        <div className="stepper">
          <button
            onClick={() => onSidesChange(Math.max(MIN_SIDES, sides - 1))}
            disabled={sides === MIN_SIDES}
            aria-label="Fewer vertices"
          >
            <Minus size={16} />
          </button>
          <output htmlFor="vertices">{sides}</output>
          <button
            onClick={() => onSidesChange(Math.min(MAX_SIDES, sides + 1))}
            disabled={sides === MAX_SIDES}
            aria-label="More vertices"
          >
            <Plus size={16} />
          </button>
        </div>
        <input
          id="vertices"
          type="range"
          min={MIN_SIDES}
          max={MAX_SIDES}
          value={sides}
          onChange={(event) => onSidesChange(Number(event.target.value))}
          style={
            {
              '--range-progress': `${((sides - MIN_SIDES) / (MAX_SIDES - MIN_SIDES)) * 100}%`,
            } as CSSProperties
          }
        />
        <div className="range-labels">
          <span>{MIN_SIDES}</span>
          <span>{MAX_SIDES}</span>
        </div>
        <button className="primary-button" onClick={onNewPuzzle}>
          New puzzle
        </button>
        {sides !== puzzleSides && (
          <p className="settings-caption">Next puzzle: {sides} vertices.</p>
        )}
      </section>

      <section className="legend-card" aria-labelledby="legend-title">
        <h2 id="legend-title">Lines</h2>
        {legend.map(({ state, label, description }) => (
          <div className="legend-row" key={state}>
            <span className={`legend-stroke ${state}-stroke`} />
            <span>{label}</span>
            <small>{description}</small>
          </div>
        ))}
        <div className="legend-footnote">
          <Check size={13} />
          <span>Correct position</span>
        </div>
      </section>
    </aside>
  )
}
