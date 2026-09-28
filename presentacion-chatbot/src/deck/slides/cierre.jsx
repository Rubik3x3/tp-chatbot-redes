import { Slide, Title, Mono, Table, P, H3 } from '../ui'

/* 09 — Límites ---------------------------------------------------------------
   Errores reales del modelo entrenado, con la causa de cada uno y cambios
   concretos que los evitarían.
-------------------------------------------------------------------------- */
const ERRORES = [
  ['¿Cuánto sale una pizza?', 'mesas_examen', '99,97 %', 'Reconoce solo «una».'],
  ['¿Quién ganó el partido ayer?', 'analitico', '82,32 %', 'Reconoce solo «el».'],
  ['¿Qué hora es?', 'despedida', '60,20 %', 'Pasa el umbral por dos décimas.'],
]

const MEJORAS = [
  'Derivar a la escuela cuando todas las palabras reconocidas son artículos, preposiciones o similares (el, la, una, de, qué, es).',
  'Agregar una intención fuera_de_tema, entrenada con preguntas ajenas a la escuela.',
  'Quitar también el «¿» al limpiar el texto: hoy «¿cuándo» y «cuándo» son palabras distintas.',
]

export function Limites() {
  return (
    <Slide>
      <Title>Dónde se equivoca</Title>

      <Table
        className="mt-9"
        head={['Mensaje', 'Respondió', 'Certeza', 'Causa']}
        mono={[0, 1, 2]}
        rows={ERRORES.map(([m, tag, p, c]) => [
          m,
          tag,
          <span className="text-[var(--k-alert)]">{p}</span>,
          c,
        ])}
      />

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <H3>Por qué pasa</H3>
          <P className="mt-3">
            Softmax siempre reparte el 100 % entre las 11 intenciones, aunque el mensaje tenga una sola palabra
            conocida. Con tan poca información la red puede quedar muy segura sin motivo, y el umbral no alcanza
            para frenarla.
          </P>
        </div>
        <div>
          <H3>Qué se podría cambiar</H3>
          <ol className="mt-3 space-y-2.5">
            {MEJORAS.map((m, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-[1.55] text-[var(--k-dim)]">
                <Mono className="shrink-0 pt-[2px] text-[13px] text-[var(--k-accent)]">{i + 1}</Mono>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Slide>
  )
}

/* 10 — Gracias --------------------------------------------------------------- */
export function Gracias() {
  return (
    <Slide>
      <p className="text-center text-[clamp(3.5rem,9vw,7.5rem)] font-medium tracking-[-0.045em] text-[var(--k-text)]">
        Gracias
      </p>
    </Slide>
  )
}
