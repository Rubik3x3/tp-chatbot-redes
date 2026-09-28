import { Slide, Title, Mono, Code, Split, Note, Panel, C } from '../ui'

/* 06 — Inferencia ------------------------------------------------------------
   Un mensaje real atravesando app.py. Las cifras salen del modelo entrenado
   que está en back/.
-------------------------------------------------------------------------- */
const RUTA = `@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    if not user_message:
        return jsonify({"response": "No enviaste ningún mensaje."}), 400

    p = bow(user_message, words)
    res = model.predict(np.array([p]))[0]

    ERROR_THRESHOLD = 0.60
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)

    if results:
        tag = classes[results[0][0]]
        for i in intents['intents']:
            if i['tag'] == tag:
                response_text = i['responses'][0]
                break
    else:
        response_text = "No fue posible interpretar la consulta. …"

    return jsonify({"response": response_text})`

const PASOS = [
  ['Llega el pedido', <><C>{'{"message": "¿Cuándo empiezan las pasantías?"}'}</C></>],
  ['Se vectoriza', <>Se marcan 4 de las 176 posiciones: <C>¿cuándo</C> <C>empiezan</C> <C>las</C> <C>pasantías</C></>],
  ['La red predice', <>Devuelve 11 probabilidades, una por tag.</>],
  ['Se aplica el umbral', <><C>pasantias</C> obtiene 100 %, más que 0,60.</>],
  ['Se responde', <>Busca ese tag en <C>intents.json</C> y devuelve su texto.</>],
]

export function Inferencia() {
  return (
    <Slide>
      <Split
        cols={['lg:col-span-5', 'lg:col-span-7']}
        left={
          <>
            <Title className="max-w-[11ch]">Recorrido de un mensaje</Title>
            <ol className="mt-8 space-y-5">
              {PASOS.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <Mono className="w-4 shrink-0 pt-[2px] text-[13px] text-[var(--k-accent)]">{i + 1}</Mono>
                  <div>
                    <p className="text-[16px] font-medium text-[var(--k-text)]">{t}</p>
                    <p className="mt-1 text-[14.5px] leading-[1.55] text-[var(--k-dim)]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        }
        right={<Code file="back/app.py" size={12}>{RUTA}</Code>}
      />
    </Slide>
  )
}

/* 07 — Umbral ----------------------------------------------------------------
   Dos distribuciones reales de softmax: una frase conocida y una que no tiene
   ninguna palabra del vocabulario. La línea punteada es ERROR_THRESHOLD.
-------------------------------------------------------------------------- */
function Bars({ message, bars, verdict }) {
  const H = 190
  return (
    <div>
      <p className="font-mono-k text-[15px] text-[var(--k-text)]">"{message}"</p>
      <div className="relative mt-10" style={{ height: H }}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--k-line-strong)]" />
        <div className="absolute inset-x-0 border-t border-dashed border-[var(--k-accent)]" style={{ bottom: H * 0.6 }}>
          <Mono className="absolute right-0 -top-[22px] text-[12px] text-[var(--k-accent-ink)]">60 %</Mono>
        </div>
        <div className="absolute inset-0 flex items-end gap-6 pr-14">
          {bars.map((b) => {
            const h = Math.max(2, (b.v / 100) * H)
            return (
              <div key={b.tag} className="relative flex h-full flex-1 flex-col justify-end">
                <Mono
                  className="absolute inset-x-0 text-center text-[13px] tabular-nums text-[var(--k-text)]"
                  style={{ bottom: h + 8 }}
                >
                  {b.p}
                </Mono>
                <div
                  className="k-grow rounded-t-[3px]"
                  style={{ height: h, background: b.v > 60 ? 'var(--k-accent)' : 'var(--k-line-strong)' }}
                />
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex gap-6 pr-14">
        {bars.map((b) => (
          <Mono key={b.tag} className="mt-2.5 flex-1 truncate text-center text-[12px] text-[var(--k-faint)]">{b.tag}</Mono>
        ))}
      </div>
      <p className="mt-5 text-[15px] text-[var(--k-dim)]">{verdict}</p>
    </div>
  )
}

export function Umbral() {
  return (
    <Slide>
      <Title>Si ninguna intención supera el 60 %, el bot no adivina</Title>

      <div className="mt-10 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <Bars
          message="Hola, buenas tardes"
          bars={[
            { tag: 'saludo', v: 100, p: '100 %' },
            { tag: 'despedida', v: 0, p: '0 %' },
            { tag: 'especialidades', v: 0, p: '0 %' },
            { tag: 'otras 8', v: 0, p: '0 %' },
          ]}
          verdict="Supera el umbral: responde con el saludo."
        />
        <Bars
          message="xyz"
          bars={[
            { tag: 'saludo', v: 30.31, p: '30,3 %' },
            { tag: 'despedida', v: 30.06, p: '30,1 %' },
            { tag: 'especialidades', v: 11.58, p: '11,6 %' },
            { tag: 'otras 8', v: 28.05, p: '28,0 %' },
          ]}
          verdict="Ninguna palabra conocida, ninguna barra pasa la línea: deriva a la escuela."
        />
      </div>

      <Panel tone="accent" className="mt-10 px-6 py-4">
        <p className="text-[15.5px] leading-[1.6] text-[var(--k-text)]">
          «No fue posible interpretar la consulta. Podés reformularla o comunicarte con la escuela a
          det_36_de15@bue.edu.ar o al (011) 5197-6276.»
        </p>
      </Panel>
      <Note className="mt-3">
        Un mensaje vacío no llega a la red: la API responde 400 con «No enviaste ningún mensaje.»
      </Note>
    </Slide>
  )
}
