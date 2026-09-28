import { useLayoutEffect, useRef, useState } from 'react'

// Primitivas compartidas por todas las diapositivas.
// Geist para el texto, Geist Mono para código y datos. Bordes de un píxel,
// esquinas levemente redondeadas y el celeste reservado para una idea por
// diapositiva.

/* Lienzo fijo escalado ------------------------------------------------------
   Las diapositivas se maquetan contra un lienzo de 1280 × 720 y el lienzo
   entero se escala hasta llenar la pantalla, como en Keynote: el texto se ve
   del mismo tamaño relativo en cualquier monitor y todas las diapositivas
   comparten la misma escala.

   Debajo de `MODO_LIENZO_DESDE` se vuelve al flujo normal con scroll: los
   breakpoints de Tailwind miran el viewport y no el lienzo.
-------------------------------------------------------------------------- */
const LIENZO_ANCHO = 1280
const LIENZO_ALTO = 720
const LIENZO_PAD_X = 64
const LIENZO_PAD_Y = 26
const MODO_LIENZO_DESDE = 1024

// Aire reservado para el encabezado y el pie del motor.
const AIRE_SUPERIOR = 48
const AIRE_INFERIOR = 56

// Si el contenido no entra en el alto útil se lo reduce, con un piso: si una
// diapositiva lo alcanza hay que recortarle contenido, no bajar el piso.
const AJUSTE_MINIMO = 0.62
const ALTO_UTIL = LIENZO_ALTO - LIENZO_PAD_Y * 2

export function Slide({ children, className = '' }) {
  const caja = useRef(null)
  const contenido = useRef(null)
  const [lienzo, setLienzo] = useState(null)
  const [ajuste, setAjuste] = useState(1)

  useLayoutEffect(() => {
    const medir = () => {
      const c = caja.current
      const n = contenido.current
      if (!c || !n) return

      const ancho = c.clientWidth
      const alto = c.clientHeight
      if (!ancho || !alto) return

      setLienzo(
        ancho < MODO_LIENZO_DESDE
          ? null
          : Math.min(ancho / LIENZO_ANCHO, alto / LIENZO_ALTO)
      )

      // scale() no participa del layout: offsetHeight sigue midiendo el alto
      // natural aunque el nodo ya esté escalado.
      const natural = n.offsetHeight
      if (natural) setAjuste(Math.max(AJUSTE_MINIMO, Math.min(1, ALTO_UTIL / natural)))
    }

    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(caja.current)
    ro.observe(contenido.current)
    // Las webfonts cambian las métricas después del primer layout.
    document.fonts?.ready.then(medir).catch(() => {})
    return () => ro.disconnect()
  }, [])

  const enLienzo = lienzo != null

  return (
    <section
      className={`flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ paddingTop: AIRE_SUPERIOR, paddingBottom: AIRE_INFERIOR }}
    >
      <div ref={caja} className="flex h-full w-full items-center justify-center">
        <div
          className={enLienzo ? 'flex shrink-0 items-center' : 'k-scroll h-full w-full overflow-y-auto px-6 sm:px-10'}
          style={
            enLienzo
              ? {
                  width: LIENZO_ANCHO,
                  height: LIENZO_ALTO,
                  paddingLeft: LIENZO_PAD_X,
                  paddingRight: LIENZO_PAD_X,
                  transform: `scale(${lienzo})`,
                }
              : undefined
          }
        >
          <div
            ref={contenido}
            className="k-stagger w-full"
            style={enLienzo && ajuste < 1 ? { transform: `scale(${ajuste})` } : undefined}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Title({ children, className = '' }) {
  return (
    <h2
      className={`text-[var(--k-text)] font-medium tracking-[-0.03em] leading-[1.1] text-[clamp(1.75rem,3.4vw,2.6rem)] ${className}`}
    >
      {children}
    </h2>
  )
}

// Realce dentro de un título: solo color, una vez por frase.
export function Em({ children }) {
  return <em className="not-italic text-[var(--k-accent)]">{children}</em>
}

export function Lead({ children, className = '' }) {
  return (
    <p className={`max-w-[64ch] text-[17px] leading-[1.6] text-[var(--k-dim)] ${className}`}>
      {children}
    </p>
  )
}

export function Mono({ children, className = '', style }) {
  return <span className={`font-mono-k ${className}`} style={style}>{children}</span>
}

// Código en línea dentro de un párrafo.
export function C({ children }) {
  return (
    <code className="font-mono-k rounded-[4px] bg-[var(--k-code)] px-[4px] py-[1px] text-[0.88em] text-[var(--k-text)]">
      {children}
    </code>
  )
}

export function H3({ children, className = '' }) {
  return (
    <h3 className={`text-[17px] font-medium leading-snug text-[var(--k-text)] ${className}`}>
      {children}
    </h3>
  )
}

export function P({ children, className = '' }) {
  return <p className={`text-[15px] leading-[1.6] text-[var(--k-dim)] ${className}`}>{children}</p>
}

export function Note({ children, className = '' }) {
  return <p className={`text-[13px] leading-[1.55] text-[var(--k-faint)] ${className}`}>{children}</p>
}

// Bloque con borde de un píxel. `accent` pinta un filete celeste a la
// izquierda; `alert`, uno rojo.
export function Panel({ children, tone = 'plain', className = '' }) {
  const edge =
    tone === 'accent'
      ? 'border-l-2 border-l-[var(--k-accent)]'
      : tone === 'alert'
        ? 'border-l-2 border-l-[var(--k-alert)]'
        : ''
  return (
    <div className={`rounded-[6px] border border-[var(--k-line)] bg-[var(--k-panel)] ${edge} ${className}`}>
      {children}
    </div>
  )
}

/* Resaltado de código ------------------------------------------------------
   Alcanza con cuatro categorías: comentarios en gris, cadenas y números en
   celeste oscuro, palabras reservadas en negro medio y el resto en gris.
-------------------------------------------------------------------------- */
const TOKENS =
  /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(\d+(?:\.\d+)?)\b|\b(def|return|for|in|if|else|import|from|as|with|const|await|async|method|body|headers)\b/g

function highlight(src) {
  const out = []
  let last = 0
  let m
  TOKENS.lastIndex = 0
  while ((m = TOKENS.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index))
    const [text, comment, string, number, keyword] = m
    const color = comment
      ? 'var(--k-faint)'
      : string || number
        ? 'var(--k-accent-ink)'
        : keyword
          ? 'var(--k-text)'
          : undefined
    out.push(
      <span key={m.index} style={{ color, fontWeight: keyword ? 500 : undefined }}>
        {text}
      </span>
    )
    last = m.index + text.length
  }
  if (last < src.length) out.push(src.slice(last))
  return out
}

export function Code({ children, file, className = '', size = 12.5 }) {
  return (
    <div className={`overflow-hidden rounded-[6px] border border-[var(--k-line)] bg-[var(--k-code)] ${className}`}>
      {file && (
        <div className="font-mono-k border-b border-[var(--k-line)] px-4 py-2 text-[11.5px] text-[var(--k-faint)]">
          {file}
        </div>
      )}
      <pre
        className="font-mono-k overflow-x-auto k-scroll px-4 py-3.5 leading-[1.65] text-[var(--k-dim)] whitespace-pre"
        style={{ fontSize: size }}
      >
        {highlight(children)}
      </pre>
    </div>
  )
}

// Tabla reglada: filas separadas por filetes, encabezado en gris.
export function Table({ head, rows, className = '', mono = [] }) {
  return (
    <div className={`overflow-x-auto k-scroll ${className}`}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className="border-b border-[var(--k-line-strong)] pb-2.5 pr-6 align-bottom text-[13px] font-normal text-[var(--k-faint)] last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`border-b border-[var(--k-line)] py-3 pr-6 last:pr-0 text-[14.5px] leading-[1.5] ${
                    j === 0 ? 'text-[var(--k-text)]' : 'text-[var(--k-dim)]'
                  } ${mono.includes(j) ? 'font-mono-k text-[13px]' : ''}`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Cifra grande + descripción.
export function Stat({ value, label, tone = 'plain' }) {
  const color = tone === 'accent' ? 'var(--k-accent)' : 'var(--k-text)'
  return (
    <div>
      <div className="font-mono-k text-[30px] font-medium leading-none tabular-nums tracking-[-0.02em]" style={{ color }}>
        {value}
      </div>
      <p className="mt-2 text-[13.5px] leading-[1.45] text-[var(--k-dim)]">{label}</p>
    </div>
  )
}

// Rejilla de dos columnas separadas por un filete vertical.
export function Split({ left, right, cols = ['lg:col-span-6', 'lg:col-span-6'], className = '' }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-9 lg:gap-0 ${className}`}>
      <div className={`${cols[0]} lg:pr-10`}>{left}</div>
      <div className={`${cols[1]} lg:border-l lg:border-[var(--k-line)] lg:pl-10`}>{right}</div>
    </div>
  )
}
