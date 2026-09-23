import json
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout

# 1. Cargar la base de conocimiento
with open('intents.json', 'r', encoding='utf-8') as f:
    intents = json.load(f)

words = []
classes = []
documents = []
ignore_letters = ['?', '¿', '!', '¡', '.', ',']

# 2. Preprocesamiento básico (Tokenización manual por espacios)
for intent in intents['intents']:
    for pattern in intent['patterns']:
        # Tokenizar palabras de forma simple y pasarlas a minúsculas
        word_list = [w.lower().strip('?!¡.,') for w in pattern.split()]
        words.extend(word_list)
        documents.append((word_list, intent['tag']))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# Limpiar duplicados y ordenar
words = sorted(list(set([w for w in words if w not in ignore_letters])))
classes = sorted(list(set(classes)))

# Guardar estructuras para usar en el servidor
pickle.dump(words, open('words.pkl', 'wb'))
pickle.dump(classes, open('classes.pkl', 'wb'))

# 3. Crear el set de entrenamiento (Bag of Words)
training = []
output_empty = [0] * len(classes)

for doc in documents:
    bag = []
    word_patterns = doc[0]
    for word in words:
        bag.append(1) if word in word_patterns else bag.append(0)

    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1
    training.append([bag, output_row])

# Mezclar y convertir a arreglos de NumPy
np.random.shuffle(training)
training = np.array(training, dtype=object)

train_x = np.array(list(training[:, 0]))
train_y = np.array(list(training[:, 1]))

# 4. Arquitectura de la Red Neuronal (Modelado Keras)
model = Sequential([
    Dense(128, input_shape=(len(train_x[0]),), activation='relu'),
    Dropout(0.5),
    Dense(64, activation='relu'),
    Dropout(0.5),
    Dense(len(classes), activation='softmax')  # Clasificación multi-clase
])

# Compilación y Entrenamiento
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
model.fit(train_x, train_y, epochs=200, batch_size=5, verbose=1)

# Guardar el modelo entrenado
model.save('chatbot_model.h5')
print("¡Modelo entrenado y guardado con éxito!")
