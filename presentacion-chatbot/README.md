# Chatbot ET 36 — presentación

Presentación del trabajo práctico del chatbot: qué responde, cómo está armado, cómo aprende
la red neuronal, cómo responde la API y dónde se equivoca.

## Cómo correrla

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

- Navegación: flechas ←/→, barra espaciadora, `Home` y `End`, los marcadores del pie o un
  gesto lateral en pantalla táctil.
- Pantalla completa: tecla `F`.
- Cada diapositiva tiene su URL (`#umbral`, `#limites`, o por número: `#07`).

## Diapositivas

| # | Tema |
|---|---|
| 1 | Portada |
| 2 | Arquitectura |
| 3-4 | `intents.json` y bolsa de palabras |
| 5 | La red neuronal y su entrenamiento |
| 6-7 | Recorrido de un mensaje y umbral de certeza |
| 8 | La API, probada con curl |
| 9 | Límites |
| 10 | Gracias |

## Cifras

Las probabilidades, el tamaño del vocabulario, la cantidad de parámetros y el tiempo de
predicción salen del modelo entrenado que está en `../back` (`chatbot_model.h5`,
`words.pkl`, `classes.pkl`). El entrenamiento no es determinista: si se vuelve a correr
`train.py`, los porcentajes de las diapositivas 7 y 9 pueden cambiar y hay que
actualizarlos.

## Código

```
src/deck/
  Engine.jsx    lista de diapositivas, navegación, encabezado y pie
  ui.jsx        primitivas (Slide, Title, Code, Table, Stat…)
  colors.js     paleta para los SVG
  deck.css      tema claro, tipografía y transiciones
  slides/       una función exportada por diapositiva
```

Para agregar, quitar o reordenar diapositivas se edita `SLIDES` en `Engine.jsx`.

`Slide` maqueta contra un lienzo fijo de 1280 × 720 y lo escala hasta llenar la pantalla.
Si el contenido excede el alto útil se reduce, con un piso de 0,62. Por debajo de 1024 px
de ancho se vuelve al flujo normal con scroll.
