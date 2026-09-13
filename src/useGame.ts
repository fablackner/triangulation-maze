import { useCallback, useEffect, useReducer, useRef } from 'react'
import { countMatches, isSolved } from './game/rules.ts'
import {
  clearSharedPuzzle,
  currentDiagonals,
  loadSession,
  randomSeed,
  saveSession,
  sessionReducer,
} from './session.ts'
import type { Session, SessionAction } from './session.ts'
import { useSound } from './useSound.ts'
import type { SoundEffect } from './useSound.ts'

type SoundCue = { kind: SoundEffect }
type GameState = {
  session: Session
  message: string
  lockedFeedback: boolean
  cue: SoundCue | null
}

// Derive feedback from the same transition that updates the game. Each flip is
// calculated once, and reducer replay never writes storage or plays audio.
function gameReducer(state: GameState, action: SessionAction): GameState {
  if ((action.type === 'undo' || action.type === 'reset') && !state.session.moves.length)
    return state
  const session = sessionReducer(state.session, action)
  if (action.type === 'flip') {
    if (session === state.session) {
      const locked =
        !isSolved(currentDiagonals(session), session.puzzle.target) &&
        currentDiagonals(session).some((line) => line.id === action.id && line.state === 'locked')
      return locked
        ? {
            ...state,
            message: 'That line is locked. Flip a neighboring line to unlock it.',
            lockedFeedback: true,
            cue: { kind: 'locked' },
          }
        : state
    }
    const solved = isSolved(currentDiagonals(session), session.puzzle.target)
    return {
      session,
      message: solved ? `Solved in ${session.moves.length} moves.` : '',
      lockedFeedback: false,
      cue: { kind: solved ? 'win' : 'flip' },
    }
  }
  return {
    session,
    message: action.type === 'reset' ? 'Puzzle reset.' : '',
    lockedFeedback: false,
    cue: action.type === 'new' ? { kind: 'new' } : null,
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, (): GameState => ({
    session: loadSession(),
    message: '',
    lockedFeedback: false,
    cue: null,
  }))
  const { enabled: soundEnabled, toggle: toggleSound, play } = useSound()
  const playedCue = useRef<SoundCue | null>(null)
  const { session, cue } = state

  useEffect(() => saveSession(session), [session])
  useEffect(() => {
    // Toggling sound must not replay a previous move, including one made muted.
    if (cue && cue !== playedCue.current) {
      playedCue.current = cue
      play(cue.kind)
    }
  }, [cue, play])

  const flip = useCallback((id: number) => dispatch({ type: 'flip', id }), [])
  const undo = useCallback(() => dispatch({ type: 'undo' }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])
  const newPuzzle = useCallback((sides: number) => {
    dispatch({ type: 'new', sides, seed: randomSeed() })
    clearSharedPuzzle()
  }, [])

  const current = currentDiagonals(session)
  const matches = countMatches(current, session.puzzle.target)
  const total = session.puzzle.sides - 3

  return {
    puzzle: session.puzzle,
    current,
    matches,
    total,
    moves: session.moves.length,
    solved: matches === total,
    message: state.message,
    lockedFeedback: state.lockedFeedback,
    flip,
    undo,
    reset,
    newPuzzle,
    soundEnabled,
    toggleSound,
  }
}
