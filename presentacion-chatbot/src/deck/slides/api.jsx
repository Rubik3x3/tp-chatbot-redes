import { Slide, Title, Mono } from '../ui'

const LLAMADAS = [
  ['"<consulta del usuario>"', 'seguridad_talleres', 'El texto de ejemplo quedó sin reemplazar. Reconoció solo «del».', true],
  ['"¿Cómo saco la constancia…?"', 'alumno_regular', 'Respuesta correcta.', false],
  ['"¿Quién ganó el partido ayer?"', 'analitico', 'Pregunta ajena a la escuela. Reconoció solo «el».', true],
  ['""', '400 Bad Request', 'Mensaje vacío, rechazado antes de llegar a la red.', false],
]

/* 08 — La API ----------------------------------------------------------------
   El contrato del endpoint y la captura entregada como evidencia.
-------------------------------------------------------------------------- */
export function LaApi() {
  return (
    <Slide>
      <Title>La API: <Mono className="text-[var(--k-accent)]">POST /chat</Mono>, probada con curl</Title>
      <p className="mt-4 text-[15px] text-[var(--k-dim)]">
        <Mono className="text-[var(--k-text)]">{'{"message": "…"}'}</Mono>
        <span className="mx-3 text-[var(--k-faint)]">→</span>
        <Mono className="text-[var(--k-text)]">{'{"response": "…"}'}</Mono>
        <span className="ml-6">Flask en el puerto 5001, con CORS para que el front pueda llamarla.</span>
      </p>

      <img
        src="/salidas-curl.png"
        alt="Terminal con cuatro pedidos curl a localhost:5001/chat y sus respuestas JSON."
        className="mt-6 w-full rounded-[8px] border border-[var(--k-line)]"
      />

      <div className="mt-6 grid grid-cols-4 gap-6">
        {LLAMADAS.map(([msg, res, det, mal], i) => (
          <div key={i}>
            <Mono className="block truncate text-[12.5px] text-[var(--k-text)]">{msg}</Mono>
            <Mono className={`mt-1 block text-[12.5px] ${mal ? 'text-[var(--k-alert)]' : 'text-[var(--k-accent-ink)]'}`}>
              → {res}
            </Mono>
            <p className="mt-1.5 text-[13px] leading-[1.45] text-[var(--k-dim)]">{det}</p>
          </div>
        ))}
      </div>
    </Slide>
  )
}
