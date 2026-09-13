import type { Diagonal, Edge } from './model.ts'

export function edgeKey(edge: Edge): string {
  return `${Math.min(edge.v1, edge.v2)}-${Math.max(edge.v1, edge.v2)}`
}

export function isBoundary(v1: number, v2: number, sides: number): boolean {
  return Math.abs(v1 - v2) === 1 || Math.abs(v1 - v2) === sides - 1
}

export function withPartners(diagonals: Diagonal[], sides: number): Diagonal[] {
  const keys = new Set(diagonals.map(edgeKey))
  return diagonals.map((diagonal) => {
    const partners = Array.from({ length: sides }, (_, k) => k).filter(
      (k) =>
        k !== diagonal.v1 &&
        k !== diagonal.v2 &&
        (isBoundary(diagonal.v1, k, sides) || keys.has(edgeKey({ v1: diagonal.v1, v2: k }))) &&
        (isBoundary(diagonal.v2, k, sides) || keys.has(edgeKey({ v1: diagonal.v2, v2: k }))),
    )
    if (partners.length !== 2)
      throw new Error('Invalid triangulation: a diagonal needs two neighboring triangles.')
    return { ...diagonal, p1: partners[0], p2: partners[1] }
  })
}

export function createFan(sides: number): Diagonal[] {
  return withPartners(
    Array.from({ length: sides - 3 }, (_, id) => ({
      id,
      v1: 0,
      v2: id + 2,
      p1: -1,
      p2: -1,
      state: 'original',
    })),
    sides,
  )
}

/** Unrestricted geometric flip for generation, without gameplay color changes. */
export function flipGeometry(diagonals: Diagonal[], id: number, sides: number): Diagonal[] {
  return withPartners(
    diagonals.map((diagonal) =>
      diagonal.id === id ? { ...diagonal, v1: diagonal.p1, v2: diagonal.p2 } : diagonal,
    ),
    sides,
  )
}
