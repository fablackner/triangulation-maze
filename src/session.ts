import { createPuzzle } from './game/generator.ts'
import { edgeKey } from './game/geometry.ts'
import { isSupportedSides, MIN_SIDES } from './game/model.ts'
import { flipDiagonal, isSolved } from './game/rules.ts'
import type { Diagonal, Puzzle } from './game/model.ts'

export type Session = { puzzle: Puzzle; history: Diagonal[][]; moves: number[] }
export type SessionAction =
  | { type: 'flip'; id: number }
  | { type: 'undo' }
  | { type: 'reset' }
  | { type: 'new'; sides: number; seed: number }

// Bump only when the generator or save format changes, not for refactors.
const SAVE_VERSION = 3
const SAVE_KEY = 'triangulation-maze:session:v1'
const MAX_SAVED_MOVES = 10000

export function newSession(sides: number, seed: number): Session {
  return { puzzle: createPuzzle(sides, seed), history: [], moves: [] }
}

export function currentDiagonals(session: Session): Diagonal[] {
  return session.history.at(-1) ?? session.puzzle.initial
}

export function sessionReducer(session: Session, action: SessionAction): Session {
  if (action.type === 'new') return newSession(action.sides, action.seed)
  if (action.type === 'reset') return { ...session, history: [], moves: [] }
  if (action.type === 'undo') {
    return { ...session, history: session.history.slice(0, -1), moves: session.moves.slice(0, -1) }
  }
  const current = currentDiagonals(session)
  if (isSolved(current, session.puzzle.target)) return session
  const next = flipDiagonal(
    current,
    action.id,
    new Set(session.puzzle.initial.map(edgeKey)),
    session.puzzle.sides,
  )
  return next
    ? { ...session, history: [...session.history, next], moves: [...session.moves, action.id] }
    : session
}

function isValidSeed(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffffff
}

export function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0]
}

/** A save stores only size, seed, and moves; the session replays from there. */
function serializeSession(session: Session): string {
  return JSON.stringify({
    version: SAVE_VERSION,
    sides: session.puzzle.sides,
    seed: session.puzzle.seed,
    moves: session.moves,
  })
}

function restoreSession(value: string | null): Session | null {
  if (!value) return null
  try {
    const saved: unknown = JSON.parse(value)
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return null
    const { version, sides, seed, moves } = saved as Record<string, unknown>
    if (
      version !== SAVE_VERSION ||
      !isSupportedSides(sides) ||
      !isValidSeed(seed) ||
      !Array.isArray(moves) ||
      moves.length > MAX_SAVED_MOVES ||
      !moves.every(
        (id: unknown) =>
          typeof id === 'number' && Number.isInteger(id) && id >= 0 && id < sides - 3,
      )
    )
      return null
    let session = newSession(sides, seed)
    for (const id of moves) {
      const next = sessionReducer(session, { type: 'flip', id })
      if (next === session) return null
      session = next
    }
    return session
  } catch {
    return null
  }
}

/** Read `?n=9&seed=42` to open a specific puzzle. */
function sharedPuzzle(search: string): { sides: number; seed: number } | null {
  const query = new URLSearchParams(search)
  const seedText = query.get('seed')
  const sidesText = query.get('n')
  const seed = Number(seedText)
  const sides = Number(sidesText)
  return seedText && sidesText && isValidSeed(seed) && isSupportedSides(sides)
    ? { sides, seed }
    : null
}

export function loadSession(): Session {
  const shared = sharedPuzzle(window.location.search)
  try {
    const saved = restoreSession(localStorage.getItem(SAVE_KEY))
    if (
      saved &&
      (!shared || (saved.puzzle.seed === shared.seed && saved.puzzle.sides === shared.sides))
    )
      return saved
  } catch {
    /* Storage can be unavailable in private or embedded browsers. */
  }
  return newSession(shared?.sides ?? MIN_SIDES, shared?.seed ?? randomSeed())
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(SAVE_KEY, serializeSession(session))
  } catch {
    /* Play also works without storage. */
  }
}

export function clearSharedPuzzle(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('seed')
  url.searchParams.delete('n')
  window.history.replaceState(null, '', url)
}
