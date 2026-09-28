import { Slide, Title, Lead, Mono, Code, Stat, Split, P, C } from '../ui'
import { K } from '../colors'

/* 03 — intents.json ----------------------------------------------------------
   El archivo que define qué sabe el bot. El fragmento es el real, recortado.
-------------------------------------------------------------------------- */
const INTENT = `{
  "tag": "alumno_regular",
  "patterns": [
    "¿Cómo saco la constancia de alumno regular?",
    "Constancia de alumno",
    "Costancia de alumno",
    "Certificado de escolaridad",
    "Papel para la obra social",
    "Constancia para el boleto estudiantil",
    …
  ],
  "responses": [
    "La constancia de alumno regular se solicita en la
     Secretaría de la escuela. […]"
  ]
}`

export function BaseDeConocimiento() {
  return (
    <Slide>
      <Split
        cols={['lg:col-span-5', 'lg:col-span-7']}
        left={
          <>
            <Title>Lo que el bot sabe está en un archivo JSON</Title>
            <P className="mt-6">
              Cada intención tiene un <C>tag</C>, una lista de <C>patterns</C> con formas en que un alumno podría
              preguntar y una <C>response</C> con el texto que devuelve el bot.
            </P>
            <P className="mt-4">
              Los patterns incluyen sinónimos y errores comunes («Costancia de alumno», «Papel para la obra
              social»). Para que entienda una forma nueva de preguntar no se toca código: se agrega la frase y se
              vuelve a entrenar.
            </P>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--k-line)] pt-6">
              <Stat value="11" label="intenciones" />
              <Stat value="115" label="frases de ejemplo" />
              <Stat value="176" label="palabras distintas" tone="accent" />
            </div>
          </>
        }
        right={<Code file="back/intents.json" size={13}>{INTENT}</Code>}
      />
    </Slide>
  )
}

/* 04 — Vectorización ---------------------------------------------------------
   La idea de bolsa de palabras con el vector real: 176 posiciones y las
   cuatro que enciende "¿Cómo saco la constancia?". Los índices salen de
   words.pkl (orden alfabético).
-------------------------------------------------------------------------- */
const VOCAB = 176
const MARCAS = [
  { i: 26, w: 'constancia' },
  { i: 76, w: 'la' },
  { i: 137, w: 'saco' },
  { i: 168, w: '¿cómo' },
]

function VectorStrip() {
  const W = 1152
  const cell = W / VOCAB
  const on = new Map(MARCAS.map((m) => [m.i, m.w]))
  return (
    <svg viewBox={`0 0 ${W} 96`} className="w-full" role="img"
      aria-label="Vector de 176 posiciones con un 1 en constancia, la, saco y ¿cómo; el resto en 0.">
      {Array.from({ length: VOCAB }, (_, i) => (
        <rect
          key={i}
          x={i * cell + 0.6}
          y={44}
          width={cell - 1.2}
          height={30}
          rx="1.5"
          fill={on.has(i) ? K.accent : K.line}
        />
      ))}
      {MARCAS.map((m) => {
        const cx = m.i * cell + cell / 2
        return (
          <g key={m.i}>
            <line x1={cx} y1={24} x2={cx} y2={40} stroke={K.accent} />
            <text x={cx} y={16} textAnchor="middle" fill={K.text} fontFamily={K.mono} fontSize="13">{m.w}</text>
          </g>
        )
      })}
      <text x={0} y={92} fill={K.faint} fontFamily={K.mono} fontSize="11.5">0</text>
      <text x={W} y={92} textAnchor="end" fill={K.faint} fontFamily={K.mono} fontSize="11.5">175</text>
    </svg>
  )
}

const BOW = `def clean_up_sentence(sentence):
    return [w.lower().strip('?!¡.,') for w in sentence.split()]

def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, word in enumerate(words):
            if word == s:
                bag[i] = 1
    return np.array(bag)`

export function Vectorizacion() {
  return (
    <Slide>
      <Title>Cada frase se convierte en 176 ceros y unos</Title>
      <Lead className="mt-5">
        La red solo opera con números. El vocabulario reúne todas las palabras de los patterns, en minúscula y sin
        repetir. Una frase se representa marcando cuáles de esas palabras aparecen.
      </Lead>

      <div className="mt-9">
        <p className="mb-4 text-[15px] text-[var(--k-dim)]">
          <Mono className="text-[var(--k-text)]">"¿Cómo saco la constancia?"</Mono>
          <span className="mx-3 text-[var(--k-faint)]">→</span>
          <Mono>['¿cómo', 'saco', 'la', 'constancia']</Mono>
        </p>
        <VectorStrip />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Code file="back/app.py" size={12}>{BOW}</Code>
        </div>
        <div className="space-y-4 lg:col-span-5">
          <P>El orden se pierde: «la constancia saco cómo» produce el mismo vector.</P>
          <P>Una palabra que no está en el vocabulario no marca ninguna posición. La red no la ve.</P>
          <P>
            Entrenamiento y servidor usan el mismo vocabulario, guardado en <C>words.pkl</C>. Si cambiara, cada
            posición dejaría de significar lo mismo.
          </P>
        </div>
      </div>
    </Slide>
  )
}
