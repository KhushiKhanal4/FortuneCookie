import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { fortunes } from './data/fortunes'
import { FortunePaper } from './components/FortunePaper'

const assets = '/Cookie-assets/'
type CookieState = 'idle' | 'pressing' | 'cracking' | 'splitting' | 'paper-sequence' | 'fortune-typing' | 'fortune-revealed'

function playCrackSound() {
  const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const duration = 0.18
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) {
    const decay = 1 - index / data.length
    data[index] = (Math.random() * 2 - 1) * decay * decay
  }
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = buffer
  filter.type = 'bandpass'
  filter.frequency.value = 1800
  filter.Q.value = 1.2
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration)
  source.connect(filter).connect(gain).connect(context.destination)
  source.start()
  source.stop(context.currentTime + duration)
  source.addEventListener('ended', () => void context.close())
}

function App() {
  const [cookieState, setCookieState] = useState<CookieState>('idle')
  const [fortune, setFortune] = useState(() => fortunes[Math.floor(Math.random() * fortunes.length)])

  const tapCookie = () => {
    if (cookieState !== 'idle') return
    playCrackSound()
    setCookieState('pressing')
    window.setTimeout(() => setCookieState('cracking'), 210)
    window.setTimeout(() => setCookieState('splitting'), 600)
    window.setTimeout(() => setCookieState('paper-sequence'), 1250)
  }

  const handlePromptClick = () => {
    if (cookieState === 'idle') {
      tapCookie()
      return
    }
    if (cookieState === 'fortune-revealed') {
      setFortune(fortunes[Math.floor(Math.random() * fortunes.length)])
      setCookieState('idle')
    }
  }

  return (
    <main className="page">
      <header className="headline-wrap">
        <img className="shine shine-left" src={`${assets}Shine.png`} alt="" />
        <h1><span>Your </span><em>fortune</em><span> is waiting</span></h1>
        <img className="shine shine-right" src={`${assets}Shine.png`} alt="" />
      </header>

      <section className="cookie-stage" aria-label="Fortune cookie">
        <img className="sticker sticker-left" src={`${assets}star-heart.png`} alt="" />
        <div className="cookie-rise">
          <button className={`cookie-button cookie-${cookieState}`} onClick={tapCookie} aria-label="Tap to crack open the fortune cookie" disabled={cookieState !== 'idle'}>
            <span className="cookie-visual">
              <img className="cookie-image cookie-idle" src={`${assets}Idle Cookie.svg`} alt="A fortune cookie" />
              <img className="cookie-image cookie-crack" src={`${assets}Crack State.svg`} alt="The cookie beginning to crack" />
              <img className="cookie-image cookie-left" src={`${assets}Left Cookie.svg`} alt="" />
              <img className="cookie-image cookie-right" src={`${assets}Right Cookie.svg`} alt="" />
              <img className="crumbles" src={`${assets}Cookie Crumbles.svg`} alt="" />
              <span className="paper-tip" aria-hidden="true" />
            </span>
          </button>
        </div>
        {cookieState !== 'idle' && cookieState !== 'pressing' && cookieState !== 'cracking' && cookieState !== 'splitting' && <FortunePaper state={cookieState} fortune={fortune} onSequenceComplete={() => setCookieState('fortune-typing')} onFortuneComplete={() => setCookieState('fortune-revealed')} />}
        <img className="sticker sticker-right" src={`${assets}star-heart.png`} alt="" />
      </section>

      <button className="prompt" onClick={handlePromptClick} disabled={cookieState !== 'idle' && cookieState !== 'fortune-revealed'}>
        <img className="arrow" src={`${assets}arrow.png`} alt="" />
        <p>{cookieState === 'fortune-revealed' ? 'Try another fortune.' : 'Tap to crack it open.'}</p>
      </button>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
