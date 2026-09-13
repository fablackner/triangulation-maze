import { createFan, edgeKey, flipGeometry } from './geometry.ts'
import { isSupportedSides, MAX_SIDES, MIN_SIDES } from './model.ts'
import type { Diagonal, Edge, Puzzle } from './model.ts'

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffledFan(sides: number, random: () => number): Diagonal[] {
  let diagonals = createFan(sides)
  for (let step = 0; step < 24 + sides * 3; step++) {
    const id = Math.floor(random() * diagonals.length)
    diagonals = flipGeometry(diagonals, id, sides)
  }
  return diagonals
}

export function createPuzzle(sides: number, seed: number): Puzzle {
  if (!isSupportedSides(sides)) {
    throw new RangeError(`Choose between ${MIN_SIDES} and ${MAX_SIDES} vertices.`)
  }
  const random = seededRandom(seed)

  // Eliahou's conjecture, proved by Gravier–Payan via the Four Color Theorem,
  // guarantees a signable route between any two triangulations. Scrambling only
  // needs to preserve geometry and meet the difficulty check, not find that route.
  for (let attempt = 0; attempt < 12; attempt++) {
    // Retry the start too: some triangulations (such as fans) have no hard target.
    const initial = shuffledFan(sides, random)
    // Exclude originals and their immediate replacements. The first move cannot
    // add a target edge, so solving needs at least N - 2 flips, including a revisit.
    const excludedKeys = new Set([
      ...initial.map(edgeKey),
      ...initial.map(({ p1, p2 }) => edgeKey({ v1: p1, v2: p2 })),
    ])
    let current = initial
    let previousId = -1
    for (let step = 0; step < sides * 30; step++) {
      const choices = current.filter((diagonal) => diagonal.id !== previousId)
      // Prefer removing excluded edges, while allowing other geometric flips.
      const unwanted = choices.filter((diagonal) => excludedKeys.has(edgeKey(diagonal)))
      const pool = unwanted.length && random() < 0.75 ? unwanted : choices
      const selected = pool[Math.floor(random() * pool.length)]
      current = flipGeometry(current, selected.id, sides)
      previousId = selected.id
      if (current.every((diagonal) => !excludedKeys.has(edgeKey(diagonal)))) {
        return {
          sides,
          seed: seed >>> 0,
          initial,
          target: current.map(({ v1, v2 }) => ({ v1, v2 })),
        }
      }
    }
  }

  // Bounded fallback with the same difficulty guarantee: a fixed pair on seven
  // vertices, extended by alternating fan edges in the start and a fan in the target.
  let initial = createFan(sides)
  for (let id = 1; id < initial.length; id += 2) {
    initial = flipGeometry(initial, id, sides)
  }
  const target: Edge[] = [
    { v1: 3, v2: 6 },
    { v1: 1, v2: 3 },
    { v1: 1, v2: 6 },
    { v1: 3, v2: 5 },
    ...Array.from({ length: sides - 7 }, (_, index) => ({ v1: 1, v2: index + 7 })),
  ]
  return { sides, seed: seed >>> 0, initial, target }
}
