export type Point = { x: number; y: number }

export function polygonPoints(sides: number, radius = 205, center = 300): Point[] {
  return Array.from({ length: sides }, (_, index) => {
    const angle = (index * Math.PI * 2) / sides - Math.PI / 2
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) }
  })
}

export function lineCoordinates(a: Point, b: Point) {
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
}
