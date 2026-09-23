# Chatbot ET 36

Requiere Python 3.12 y Node.

## Back

```bash
cd back
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train.py
python app.py
```

En Windows el entorno se activa con `venv\Scripts\activate`.

## Front

```bash
cd front
npm i
npm run dev
```

## Prueba

```bash
curl -X POST http://localhost:5001/chat -H "Content-Type: application/json" -d '{"message": "Mesas de examen"}'
```
