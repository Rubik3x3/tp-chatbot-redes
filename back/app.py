from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
import pickle
import tensorflow as tf

app = Flask(__name__)
CORS(app)  # Permite solicitudes desde el frontend de la escuela

# Cargar el modelo de IA y las estructuras de datos
model = tf.keras.models.load_model('chatbot_model.h5')
words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))

with open('intents.json', 'r', encoding='utf-8') as f:
    intents = json.load(f)

# Función auxiliar para convertir la entrada en Bag of Words
def clean_up_sentence(sentence):
    return [w.lower().strip('?!¡.,') for w in sentence.split()]

def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, word in enumerate(words):
            if word == s:
                bag[i] = 1
    return np.array(bag)

# RUTA DE RED PRINCIPAL (API REST)
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"response": "No enviaste ningún mensaje."}), 400

    # 1. Predecir con la red neuronal
    p = bow(user_message, words)
    res = model.predict(np.array([p]))[0]

    # 2. Filtrar por umbral de certeza (Requerimiento No Funcional)
    ERROR_THRESHOLD = 0.60
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)

    # 3. Determinar respuesta o aplicar Fallback
    response_text = ""
    if results:
        tag = classes[results[0][0]]
        for i in intents['intents']:
            if i['tag'] == tag:
                response_text = i['responses'][0]
                break
    else:
        # Mensaje por defecto si la red neuronal no está segura
        response_text = "No fue posible interpretar la consulta. Podés reformularla o comunicarte con la escuela a det_36_de15@bue.edu.ar o al (011) 5197-6276."

    return jsonify({"response": response_text})

if __name__ == '__main__':
    # Puerto 5001: en macOS, el 5000 suele estar ocupado por AirPlay Receiver
    app.run(host='0.0.0.0', port=5001, debug=True)
