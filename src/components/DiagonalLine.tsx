import { edgeKey } from '../game/geometry.ts'
import type { Diagonal } from '../game/model.ts'
import { lineCoordinates } from './geometry.ts'
import type { Point } from './geometry.ts'

type DiagonalLineProps = {
  diagonal: Diagonal
  points: Point[]
  matched: boolean
  hovered: boolean
  solved: boolean
  onFlip: (id: number) => void
}

export function DiagonalLine({
  diagonal,
  points,
  matched,
  hovered,
  solved,
  onFlip,
}: DiagonalLineProps) {
  const a = points[diagonal.v1]
  const b = points[diagonal.v2]
  const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  const coordinates = lineCoordinates(a, b)

  return (
    <g
      className={`diagonal line-${diagonal.state} ${matched ? 'is-matched' : ''} ${hovered ? 'is-hovered' : ''}`}
      role="button"
      aria-disabled={solved || diagonal.state === 'locked'}
      aria-label={`Diagonal ${diagonal.v1 + 1} to ${diagonal.v2 + 1}, ${diagonal.state}${matched ? ', matches target' : ''}`}
      data-diagonal-id={diagonal.id}
      data-state={diagonal.state}
      data-edge={edgeKey(diagonal)}
      onClick={(event) => {
        if (event.detail > 0) event.currentTarget.blur()
        onFlip(diagonal.id)
      }}
    >
      <line className="line-bloom" {...coordinates} aria-hidden="true" />
      <line
        key={edgeKey(diagonal)}
        className="line-visible"
        pathLength="1"
        {...coordinates}
        aria-hidden="true"
      />
      <line className="line-hit-area" {...coordinates} aria-hidden="true" />
      {matched && (
        <g
          className="match-marker"
          transform={`translate(${midpoint.x} ${midpoint.y})`}
          aria-hidden="true"
          pointerEvents="none"
        >
          <path d="m-4 0 3 3 6-7" />
        </g>
      )}
    </g>
  )
}
