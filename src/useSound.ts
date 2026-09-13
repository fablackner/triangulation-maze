import { useCallback, useEffect, useRef, useState } from 'react'

export type SoundEffect = 'flip' | 'locked' | 'win' | 'new'

export function useSound() {
  const [enabled, setEnabled] = useState(false)
  const context = useRef<AudioContext | null>(null)

  useEffect(
    () => () => {
      const audio = context.current
      context.current = null
      if (audio) void audio.close().catch(() => {})
    },
    [],
  )

  const play = useCallback(
    (kind: SoundEffect) => {
      if (!enabled) return
      try {
        context.current ??= new AudioContext()
        const audio = context.current
        void audio.resume().catch(() => {})
        const notes =
          kind === 'win'
            ? [261.63, 329.63, 392, 523.25]
            : kind === 'locked'
              ? [110, 103.83]
              : kind === 'new'
                ? [261.63, 392]
                : [329.63, 493.88]
        notes.forEach((frequency, index) => {
          const oscillator = audio.createOscillator()
          const gain = audio.createGain()
          const start = audio.currentTime + index * 0.07
          oscillator.type = 'sine'
          oscillator.frequency.value = frequency
          gain.gain.setValueAtTime(0, start)
          gain.gain.linearRampToValueAtTime(0.055, start + 0.012)
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
          oscillator.connect(gain)
          gain.connect(audio.destination)
          oscillator.start(start)
          oscillator.stop(start + 0.32)
          oscillator.onended = () => {
            oscillator.disconnect()
            gain.disconnect()
          }
        })
      } catch {
        /* Audio is an optional enhancement. */
      }
    },
    [enabled],
  )

  const toggle = useCallback(() => {
    // Unlock audio during the button's user gesture; move sounds run in effects.
    if (!enabled) {
      try {
        context.current ??= new AudioContext()
        void context.current.resume().catch(() => {})
      } catch {
        /* Audio is an optional enhancement. */
      }
    }
    setEnabled((value) => !value)
  }, [enabled])
  return { enabled, toggle, play }
}
