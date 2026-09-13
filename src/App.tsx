import { useCallback, useState } from 'react'
import { Board } from './components/Board.tsx'
import { GameControls } from './components/GameControls.tsx'
import { Header } from './components/Header.tsx'
import { HelpDialog } from './components/HelpDialog.tsx'
import { useGame } from './useGame.ts'

export default function App() {
  const game = useGame()
  const [sides, setSides] = useState(game.puzzle.sides)
  const [helpOpen, setHelpOpen] = useState(false)
  const openHelp = useCallback(() => setHelpOpen(true), [])
  const closeHelp = useCallback(() => setHelpOpen(false), [])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#play">
        Skip to the puzzle
      </a>
      <Header soundEnabled={game.soundEnabled} onToggleSound={game.toggleSound} onHelp={openHelp} />
      <main>
        <div className="game-layout" id="play">
          <section
            className={`arena ${game.solved ? 'arena-solved' : ''}`}
            aria-label="Puzzle arena"
          >
            <div className="arena-topbar">
              <span className="arena-label">{game.puzzle.sides} vertices</span>
              <div
                className="board-score"
                aria-label={`${game.moves} moves, ${game.matches} of ${game.total} lines aligned`}
              >
                <span>
                  {game.moves} <small>moves</small>
                </span>
                <span>
                  {game.matches}/{game.total} <small>matched</small>
                </span>
              </div>
            </div>
            <div className="board-stage">
              <div className="stage-glow" aria-hidden="true" />
              <div className="synth-grid" aria-hidden="true" />
              <Board
                key={`${game.puzzle.seed}-${game.puzzle.sides}`}
                sides={game.puzzle.sides}
                diagonals={game.current}
                initial={game.puzzle.initial}
                target={game.puzzle.target}
                solved={game.solved}
                onFlip={game.flip}
              />
            </div>
          </section>
          <GameControls
            sides={sides}
            puzzleSides={game.puzzle.sides}
            moves={game.moves}
            matches={game.matches}
            solved={game.solved}
            onSidesChange={setSides}
            onNewPuzzle={() => game.newPuzzle(sides)}
            onUndo={game.undo}
            onReset={game.reset}
          />
        </div>
        <p
          className={game.lockedFeedback ? 'feedback feedback-locked' : 'feedback'}
          role="status"
          aria-live="polite"
        >
          {game.message}
        </p>
      </main>
      <HelpDialog open={helpOpen} onClose={closeHelp} />
    </div>
  )
}
