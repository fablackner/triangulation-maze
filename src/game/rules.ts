import { edgeKey, withPartners } from './geometry.ts'
import type { Diagonal, Edge } from './model.ts'

/** Replace the diagonal, toggle its non-original neighbors, and restore originals. */
export function flipDiagonal(
  diagonals: Diagonal[],
  id: number,
  initialKeys: ReadonlySet<string>,
  sides: number,
): Diagonal[] | null {
  const selected = diagonals.find((diagonal) => diagonal.id === id)
  if (!selected || selected.state === 'locked') return null

  const quad = [selected.v1, selected.p1, selected.v2, selected.p2]
  const neighbors = new Set(
    quad.map((vertex, index) => edgeKey({ v1: vertex, v2: quad[(index + 1) % 4] })),
  )

  const next = diagonals.map((diagonal): Diagonal => {
    let result = { ...diagonal }
    if (diagonal.id === id) {
      result = { ...diagonal, v1: selected.p1, v2: selected.p2, state: 'available' }
    } else if (neighbors.has(edgeKey(diagonal))) {
      if (result.state === 'available') result.state = 'locked'
      else if (result.state === 'locked') result.state = 'available'
    }
    if (initialKeys.has(edgeKey(result))) result.state = 'original'
    return result
  })
  return withPartners(next, sides)
}

export function countMatches(diagonals: Edge[], target: Edge[]): number {
  const targetKeys = new Set(target.map(edgeKey))
  return diagonals.filter((diagonal) => targetKeys.has(edgeKey(diagonal))).length
}

export function isSolved(diagonals: Edge[], target: Edge[]): boolean {
  return diagonals.length === target.length && countMatches(diagonals, target) === target.length
}
