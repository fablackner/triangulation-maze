export const MIN_SIDES = 7
export const MAX_SIDES = 17

export type LineState = 'original' | 'available' | 'locked'
export type Edge = { v1: number; v2: number }
export type Diagonal = Edge & { id: number; p1: number; p2: number; state: LineState }
export type Puzzle = {
  sides: number
  seed: number
  initial: Diagonal[]
  target: Edge[]
}

export function isSupportedSides(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isInteger(value) && value >= MIN_SIDES && value <= MAX_SIDES
  )
}
