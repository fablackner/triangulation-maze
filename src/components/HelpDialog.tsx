import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

type HelpDialogProps = { open: boolean; onClose: () => void }

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    else if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="help-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      aria-labelledby="help-title"
    >
      <div className="dialog-content">
        <button
          className="dialog-close icon-button"
          onClick={onClose}
          aria-label="Close instructions"
        >
          <X size={20} />
        </button>
        <h2 id="help-title">How to play</h2>
        <p className="dialog-intro">
          Flip the solid diagonals until they match the dashed pink target.
        </p>
        <ol className="rules-list">
          <li>
            <h3>Flip a diagonal</h3>
            <p>
              Click a white or green line. Its two neighboring triangles form a quadrilateral; the
              line flips to the other diagonal of that shape. Hover to preview the flip.
            </p>
          </li>
          <li>
            <h3>Neighboring lines change color</h3>
            <p>
              A new line is green. Each flip toggles neighboring green lines to red (locked), and
              red lines back to green. Faint gray lines show the starting layout. When a diagonal
              returns to one of those positions, it gets its original white color back and stays
              flippable.
            </p>
          </li>
          <li>
            <h3>Match the target</h3>
            <p>
              Match all dashed pink lines. A green check marks a correctly positioned line. Red
              lines can be correctly positioned too; the color only determines whether a line can be
              flipped.
            </p>
          </li>
        </ol>
        <button className="primary-button" onClick={onClose}>
          Close
        </button>
      </div>
    </dialog>
  )
}
