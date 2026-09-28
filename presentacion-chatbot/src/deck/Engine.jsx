import { useCallback, useEffect, useRef, useState } from 'react'

import './deck.css'
import { Portada, Arquitectura } from './slides/intro'
import { BaseDeConocimiento, Vectorizacion } from './slides/datos'
import { LaRed } from './slides/modelo'
import { Inferencia, Umbral } from './slides/inferencia'
import { LaApi } from './slides/api'
import { Limites, Gracias } from './slides/cierre'

// Manifiesto del mazo. El orden sigue el recorrido de un mensaje: qué se
// resuelve, cómo está armado, cómo aprende, cómo responde y dónde falla.
const SLIDES = [
  { id: 'portada', Component: Portada, label: 'Portada' },
  { id: 'arquitectura', Component: Arquitectura, label: 'Arquitectura' },
  { id: 'intents', Component: BaseDeConocimiento, label: 'La base de conocimiento' },
  { id: 'vectores', Component: Vectorizacion, label: 'Del texto a un vector' },
  { id: 'red', Component: LaRed, label: 'La red y su entrenamiento' },
  { id: 'inferencia', Component: Inferencia, label: 'Recorrido de un mensaje' },
  { id: 'umbral', Component: Umbral, label: 'Umbral de certeza' },
  { id: 'api', Component: LaApi, label: 'La API' },
  { id: 'limites', Component: Limites, label: 'Límites' },
  { id: 'gracias', Component: Gracias, label: 'Gracias' },
]

const TRANSITION_MS = 400

const Chevron = ({ dir = 1, ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {dir > 0 ? <path d="M9 5l7 7-7 7" /> : <path d="M15 5l-7 7 7 7" />}
  </svg>
)

// Permite abrir el mazo directamente en una diapositiva (#umbral o #09).
function slideFromHash() {
  const raw = window.location.hash.replace('#', '')
  if (!raw) return 0
  const byId = SLIDES.findIndex((s) => s.id === raw)
  if (byId >= 0) return byId
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? Math.max(0, Math.min(SLIDES.length - 1, n - 1)) : 0
}

export default function Engine() {
  const [current, setCurrent] = useState(slideFromHash)
  const [outgoing, setOutgoing] = useState(null)
  const [direction, setDirection] = useState(1)
  const tokenRef = useRef(0)
  const total = SLIDES.length

  useEffect(() => {
    document.documentElement.classList.add('k-light')
    return () => document.documentElement.classList.remove('k-light')
  }, [])

  const goTo = useCallback(
    (index) => {
      const next = Math.max(0, Math.min(total - 1, index))
      if (next === current) return
      const dir = next > current ? 1 : -1
      const token = ++tokenRef.current
      setDirection(dir)
      setOutgoing({ index: current, direction: dir, token })
      setCurrent(next)
      window.setTimeout(() => {
        if (tokenRef.current === token) setOutgoing(null)
      }, TRANSITION_MS)
    },
    [current, total]
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    const id = SLIDES[current].id
    if (window.location.hash.replace('#', '') !== id) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }, [current])

  useEffect(() => {
    const onHash = () => setCurrent(slideFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev() }
      else if (e.key === 'Home') goTo(0)
      else if (e.key === 'End') goTo(total - 1)
      else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.().catch(() => {})
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, goTo, total])

  // Gesto lateral para exponer desde una tablet. El desplazamiento horizontal
  // tiene que dominar sobre el vertical para no confundirlo con un scroll.
  const touchRef = useRef(null)
  const onTouchStart = useCallback((e) => {
    const t = e.changedTouches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }, [])
  const onTouchEnd = useCallback(
    (e) => {
      const start = touchRef.current
      if (!start) return
      touchRef.current = null
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.6) return
      if (dx < 0) next()
      else prev()
    },
    [next, prev]
  )

  const Active = SLIDES[current].Component
  const Outgoing = outgoing != null ? SLIDES[outgoing.index].Component : null

  const enterClass = direction > 0 ? 'k-enter-fwd' : 'k-enter-bwd'
  const leaveClass = outgoing && outgoing.direction > 0 ? 'k-leave-fwd' : 'k-leave-bwd'

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-[var(--k-bg)] text-[var(--k-text)]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <header className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-10 lg:px-14 pt-5 text-[13px] text-[var(--k-faint)]">
        <span>Chatbot ET 36</span>
        <span className="font-mono-k text-[12px] tabular-nums">
          <span className="text-[var(--k-text)]">{current + 1}</span>
          <span className="mx-1">/</span>
          {total}
        </span>
      </header>

      <main className="relative z-10 h-full w-full">
        {Outgoing && (
          <div
            key={`out-${outgoing.index}-${outgoing.token}`}
            className={`absolute inset-0 ${leaveClass}`}
            aria-hidden="true"
          >
            <Outgoing />
          </div>
        )}
        <div key={`in-${current}`} className={`absolute inset-0 ${enterClass}`}>
          <Active />
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-6 px-6 sm:px-10 lg:px-14 pb-5">
        <nav className="flex items-center gap-[5px]" aria-label="Diapositivas">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              title={s.label}
              aria-label={`Ir a ${s.label}`}
              aria-current={i === current ? 'true' : undefined}
              className="group -my-2.5 py-2.5"
            >
              <span
                className={`block h-[3px] rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-[var(--k-accent)]'
                    : 'w-[10px] bg-[var(--k-line-strong)] group-hover:bg-[var(--k-faint)]'
                }`}
              />
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={prev}
            disabled={current === 0}
            aria-label="Anterior"
            className="p-2 text-[var(--k-faint)] transition-colors hover:text-[var(--k-text)] disabled:opacity-30 disabled:hover:text-[var(--k-faint)]"
          >
            <Chevron dir={-1} className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            disabled={current === total - 1}
            aria-label="Siguiente"
            className="p-2 text-[var(--k-faint)] transition-colors hover:text-[var(--k-text)] disabled:opacity-30 disabled:hover:text-[var(--k-faint)]"
          >
            <Chevron dir={1} className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  )
}
