import { Slide, Title, Lead, P, H3, C } from '../ui'
import { K } from '../colors'

/* 05 — La red y su entrenamiento ---------------------------------------------
   Arquitectura real (model.summary()): 176 → 128 → 64 → 11. Las cantidades
   de parámetros son entradas × neuronas + un sesgo por neurona.
-------------------------------------------------------------------------- */
const CAPAS = [
  { n: 176, name: 'entrada', act: 'vector 0 y 1', h: 200 },
  { n: 128, name: 'oculta', act: 'ReLU', h: 160 },
  { n: 64, name: 'oculta', act: 'ReLU', h: 116 },
  { n: 11, name: 'salida', act: 'softmax', h: 64, accent: true },
]
const PARAMS = ['22.656', '8.256', '715']

function Network() {
  const W = 1152
  const colW = 120
  const xs = [0, 344, 688, 1032]
  const mid = 132
  return (
    <svg viewBox={`0 0 ${W} 300`} className="w-full" role="img"
      aria-label="Red densa: 176 entradas, capas ocultas de 128 y 64 neuronas con ReLU, 11 salidas con softmax.">
      {/* Conexiones densas: un abanico de líneas entre bordes de capas vecinas */}
      {CAPAS.slice(0, -1).map((c, i) => {
        const d = CAPAS[i + 1]
        const x1 = xs[i] + colW
        const x2 = xs[i + 1]
        const lines = []
        for (let a = 0; a < 6; a++) {
          for (let b = 0; b < 6; b++) {
            const y1 = mid - c.h / 2 + 12 + (a * (c.h - 24)) / 5
            const y2 = mid - d.h / 2 + 8 + (b * (d.h - 16)) / 5
            lines.push(<line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={K.lineStrong} strokeOpacity="0.55" strokeWidth="0.7" />)
          }
        }
        return (
          <g key={i}>
            {lines}
            <text x={(x1 + x2) / 2} y={16} textAnchor="middle" fill={K.faint} fontFamily={K.mono} fontSize="12">
              {PARAMS[i]} parámetros
            </text>
            {i > 0 && (
              <text x={(x1 + x2) / 2} y={mid + 96} textAnchor="middle" fill={K.faint} fontFamily={K.sans} fontSize="12.5">
                dropout 0,5
              </text>
            )}
          </g>
        )
      })}

      {CAPAS.map((c, i) => (
        <g key={i}>
          <rect
            x={xs[i]} y={mid - c.h / 2} width={colW} height={c.h} rx="8"
            fill={c.accent ? K.accentSoft : K.panel}
            stroke={c.accent ? K.accent : K.lineStrong}
          />
          <text x={xs[i] + colW / 2} y={mid + 9} textAnchor="middle" fill={c.accent ? K.accentInk : K.text}
            fontFamily={K.mono} fontSize="26" fontWeight="500">
            {c.n}
          </text>
          <text x={xs[i] + colW / 2} y={264} textAnchor="middle" fill={K.text} fontFamily={K.sans} fontSize="15">
            {c.name}
          </text>
          <text x={xs[i] + colW / 2} y={286} textAnchor="middle" fill={K.faint} fontFamily={K.mono} fontSize="12.5">
            {c.act}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function LaRed() {
  return (
    <Slide>
      <Title>La red neuronal y su entrenamiento</Title>
      <Lead className="mt-5">
        <C>train.py</C> la entrena una sola vez con las 115 frases de ejemplo y guarda en{' '}
        <C>chatbot_model.h5</C> los 31.627 valores que aprendió.
      </Lead>

      <div className="mt-9">
        <Network />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 border-t border-[var(--k-line)] pt-6 lg:grid-cols-3">
        <div>
          <H3>Activaciones</H3>
          <P className="mt-2">
            Las capas ocultas usan ReLU: anulan los valores negativos. La salida usa softmax: 11 probabilidades
            que suman 100 %.
          </P>
        </div>
        <div>
          <H3>Dropout</H3>
          <P className="mt-2">
            Mientras entrena, apaga al azar la mitad de las neuronas en cada paso para que la red no memorice
            las frases.
          </P>
        </div>
        <div>
          <H3>Entrenamiento</H3>
          <P className="mt-2">
            200 épocas en lotes de 5: 4.600 correcciones. En cada una compara la predicción con el tag correcto
            y <C>adam</C> ajusta los pesos.
          </P>
        </div>
      </div>
    </Slide>
  )
}
