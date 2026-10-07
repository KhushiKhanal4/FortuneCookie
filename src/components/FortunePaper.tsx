import { useEffect, useState } from 'react'
import type { Fortune } from '../data/fortunes'

const framePaths = Array.from({ length: 10 }, (_, index) => `/Cookie-assets/Paper/${index + 1}.png`)

type FortunePaperProps = {
  state: string
  fortune: Fortune
  onSequenceComplete: () => void
  onFortuneComplete: () => void
}

export function FortunePaper({ state, fortune, onSequenceComplete, onFortuneComplete }: FortunePaperProps) {
  const [frames, setFrames] = useState<HTMLImageElement[]>([])
  const [frame, setFrame] = useState(0)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all(framePaths.map((path) => new Promise<HTMLImageElement>((resolve) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.src = path
    }))).then((loaded) => {
      if (mounted) setFrames(loaded)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (state !== 'paper-sequence' || frames.length !== framePaths.length) return
    let current = 0
    const timer = window.setInterval(() => {
      current += 1
      setFrame(current)
      if (current === framePaths.length - 1) {
        window.clearInterval(timer)
        window.setTimeout(onSequenceComplete, 280)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [state, frames, onSequenceComplete])

  useEffect(() => {
    if (state !== 'fortune-typing') return
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedText(fortune.text.slice(0, index))
      if (index >= fortune.text.length) {
        window.clearInterval(timer)
        window.setTimeout(onFortuneComplete, 250)
      }
    }, 42)
    return () => window.clearInterval(timer)
  }, [state, fortune.text, onFortuneComplete])

  const visibleFrame = frames[frame]
  return (
    <div className={`fortune-paper fortune-paper-${state}`} aria-live="polite">
      <div className="paper-sequence-stage">
        {visibleFrame && <img src={visibleFrame.src} alt="" />}
        {(state === 'fortune-typing' || state === 'fortune-revealed') && (
          <div className="fortune-content">
          <p>{typedText}</p>
          </div>
        )}
      </div>
    </div>
  )
}
