import { useState } from 'react'
import { edgeKey } from '../game/geometry.ts'
import type { Diagonal, Edge } from '../game/model.ts'
import { DiagonalLine } from './DiagonalLine.tsx'
import { lineCoordinates, polygonPoints } from './geometry.ts'

type BoardProps = {
  sides: number
  diagonals: Diagonal[]
  initial: Edge[]
  target: Edge[]
  solved: boolean
  onFlip: (id: number) => void
}

export function Board({ sides, diagonals, initial, target, solved, onFlip }: BoardProps) {
  const [hovered, setHovered] = useState<{ id: number; edge: string } | null>(null)
  const points = polygonPoints(sides)
  const targetKeys = new Set(target.map(edgeKey))
  const currentKeys = new Set(diagonals.map(edgeKey))
  const active =
    !solved &&
    diagonals.find((diagonal) => diagonal.id === hovered?.id && edgeKey(diagonal) === hovered.edge)
  const preview = active && active.state !== 'locked' ? active : null
  const flip = (id: number) => {
    setHovered(null)
    onFlip(id)
  }

  return (
    <svg
      className={`game-board ${solved ? 'is-solved' : ''}`}
      viewBox="0 0 600 600"
      role="group"
      aria-labelledby="board-title"
      aria-describedby="board-description"
      data-testid="game-board"
      onPointerLeave={() => setHovered(null)}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch') return
        const line = (event.target as Element).closest<SVGGElement>('[data-diagonal-id]')
        // Only pointer movement activates a preview. Replacing a line beneath a
        // stationary pointer after a flip must not immediately activate it again.
        setHovered(line ? { id: Number(line.dataset.diagonalId), edge: line.dataset.edge! } : null)
      }}
    >
      <title id="board-title">{sides}-vertex triangulation puzzle</title>
      <desc id="board-description">
        Flip the solid diagonals to match the pink dashed target on this polygon. White original
        lines and green available lines can be flipped. Red lines cannot. Faint gray lines preserve
        the starting triangulation. Returning to one of those edges restores its original,
        always-flippable state. A green check marks a correctly positioned line.
      </desc>
      <defs>
        <radialGradient id="polygon-fill">
          <stop offset="0%" stopColor="#302054" stopOpacity=".36" />
          <stop offset="100%" stopColor="#211833" stopOpacity=".2" />
        </radialGradient>
        <linearGradient id="boundary-color" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#9bddda" />
          <stop offset=".48" stopColor="#a98dd0" />
          <stop offset="1" stopColor="#d68cce" />
        </linearGradient>
        <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <polygon className="polygon-body" points={points.map((p) => `${p.x},${p.y}`).join(' ')} />

      <g
        className="original-lines"
        aria-hidden="true"
        pointerEvents="none"
        data-testid="original-overlay"
      >
        {initial.map((diagonal) => (
          <line
            key={edgeKey(diagonal)}
            data-original-edge={edgeKey(diagonal)}
            {...lineCoordinates(points[diagonal.v1], points[diagonal.v2])}
          />
        ))}
      </g>

      {preview && (
        <g className="flip-preview" aria-hidden="true" pointerEvents="none">
          <polygon
            points={[preview.v1, preview.p1, preview.v2, preview.p2]
              .map((index) => `${points[index].x},${points[index].y}`)
              .join(' ')}
          />
          <line {...lineCoordinates(points[preview.p1], points[preview.p2])} />
        </g>
      )}

      <g
        className="target-lines"
        aria-hidden="true"
        pointerEvents="none"
        data-testid="target-overlay"
      >
        {target.map((diagonal) => (
          <line
            key={edgeKey(diagonal)}
            {...lineCoordinates(points[diagonal.v1], points[diagonal.v2])}
            className={currentKeys.has(edgeKey(diagonal)) ? 'target-matched' : ''}
          />
        ))}
      </g>

      <g className="diagonals">
        {diagonals.map((diagonal) => (
          <DiagonalLine
            key={diagonal.id}
            diagonal={diagonal}
            points={points}
            matched={targetKeys.has(edgeKey(diagonal))}
            hovered={!!active && active.id === diagonal.id}
            solved={solved}
            onFlip={flip}
          />
        ))}
      </g>

      <g className="vertices" aria-hidden="true" pointerEvents="none">
        {points.map((point, index) => (
          <circle key={index} className="vertex-point" cx={point.x} cy={point.y} r="3.6" />
        ))}
      </g>
    </svg>
  )
}
