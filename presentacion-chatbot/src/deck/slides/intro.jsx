import { Slide, Title, P, C } from '../ui'
import { K } from '../colors'

/* 01 — Portada ---------------------------------------------------------------
   Solo el nombre, qué es y la escuela.
-------------------------------------------------------------------------- */
export function Portada() {
  return (
    <Slide>
      <h1 className="text-[clamp(3.5rem,9vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.045em] text-[var(--k-text)]">
        Chatbot ET <span className="text-[var(--k-accent)]">36</span>
      </h1>
      <p className="mt-8 max-w-[34ch] text-[24px] font-light leading-[1.35] text-[var(--k-dim)]">
        Un asistente de trámites escolares que responde con una red neuronal.
      </p>
      <p className="mt-16 text-[14px] text-[var(--k-faint)]">
        Escuela Técnica N.° 36 D.E. 15 «Almirante Guillermo Brown»
      </p>
    </Slide>
  )
}

/* 02 — Arquitectura ----------------------------------------------------------
   Tres piezas y dos momentos: train.py genera los archivos una vez, app.py
   los carga al iniciar y el front solo habla con app.py por HTTP.
-------------------------------------------------------------------------- */
function Box({ x, y, w, h, title, sub, body, accent, dashed }) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx="8"
        fill={accent ? K.accentSoft : K.panel}
        stroke={accent ? K.accent : K.lineStrong}
        strokeDasharray={dashed ? '4 4' : undefined}
      />
      <text x={x + 20} y={y + 32} fill={K.text} fontFamily={K.sans} fontSize="17" fontWeight="500">{title}</text>
      <text x={x + 20} y={y + 54} fill={accent ? K.accentInk : K.faint} fontFamily={K.mono} fontSize="12">{sub}</text>
      {body?.map((l, i) => (
        <text key={i} x={x + 20} y={y + 84 + i * 19} fill={K.dim} fontFamily={K.sans} fontSize="13.5">{l}</text>
      ))}
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, color = K.lineStrong, id }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.3" markerEnd={`url(#${id})`} />
  )
}

export function Arquitectura() {
  return (
    <Slide>
      <Title>Tres piezas que se comunican por archivos y por HTTP</Title>

      <svg viewBox="0 0 1152 330" className="mt-10 w-full" role="img"
        aria-label="El navegador envía POST /chat al servidor Flask. El servidor carga el modelo que generó train.py.">
        <defs>
          {[['ah', K.lineStrong], ['ah-a', K.accent]].map(([id, c]) => (
            <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M1 1 L9 5 L1 9" fill="none" stroke={c} strokeWidth="1.5" />
            </marker>
          ))}
        </defs>

        <Box x={0} y={20} w={300} h={140} title="Navegador" sub="front/ · React"
          body={['Muestra el chat y manda', 'cada mensaje con fetch()']} />
        <Box x={426} y={20} w={300} h={140} title="Servidor" sub="back/app.py · Flask" accent
          body={['Vectoriza el mensaje, consulta', 'la red y arma la respuesta']} />
        <Box x={852} y={20} w={300} h={140} title="Modelo entrenado" sub="chatbot_model.h5"
          body={['words.pkl · classes.pkl', 'intents.json']} />
        <Box x={852} y={236} w={300} h={78} title="train.py" sub="se ejecuta una vez" dashed />

        {/* front ⇄ back */}
        <Arrow x1={306} y1={70} x2={418} y2={70} color={K.accent} id="ah-a" />
        <text x={362} y={58} textAnchor="middle" fill={K.accentInk} fontFamily={K.mono} fontSize="12.5">POST /chat</text>
        <Arrow x1={420} y1={112} x2={308} y2={112} id="ah" />
        <text x={362} y={134} textAnchor="middle" fill={K.faint} fontFamily={K.mono} fontSize="12">JSON</text>

        {/* modelo → back */}
        <Arrow x1={846} y1={90} x2={734} y2={90} id="ah" />
        <text x={790} y={78} textAnchor="middle" fill={K.faint} fontFamily={K.sans} fontSize="12.5">al iniciar</text>

        {/* train → modelo */}
        <Arrow x1={1002} y1={232} x2={1002} y2={168} id="ah" />
        <text x={1014} y={206} fill={K.faint} fontFamily={K.sans} fontSize="12.5">genera</text>
      </svg>

      <div className="mt-8 grid grid-cols-1 gap-10 border-t border-[var(--k-line)] pt-7 lg:grid-cols-2">
        <P>
          <span className="text-[var(--k-text)]">En cada mensaje</span> trabajan solo el navegador y{' '}
          <C>app.py</C>. El front no sabe que existe una red neuronal: manda
          un texto y recibe otro.
        </P>
        <P>
          <span className="text-[var(--k-text)]">Una sola vez</span>, antes de levantar el servidor,{' '}
          <C>train.py</C> lee <C>intents.json</C>, entrena la red y
          guarda tres archivos. Si cambia el JSON, se vuelve a entrenar.
        </P>
      </div>
    </Slide>
  )
}
