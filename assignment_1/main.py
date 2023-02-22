import tensorflow as tf

print("TensorFlow version:", tf.__version__)

"""
Laad de MNIST dataset.
Normaliseer de data van 0-255 naar 0-1.
"""
dim = 255.0
mnist = tf.keras.datasets.mnist

(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / dim, x_test / dim

"""
Maak een sequentieel model.

Voeg een Flatten layer toe die een 2D input foto (28x28 pixels) omzet naar een 1D array.
Voeg een Dense layer toe met 128 neuronen en een ReLU activatie functie.
Voeg een Dropout layer toe die willekeurig 20% van de input elementen op 0 zet tijdens de training.
Voeg een Dense layer toe met 10 neuronen (1 voor elke class)

Kortom, dit model classificeert afbeeldingen van 28x28 pixels naar 10 classes.
"""
aooc = 10 # Amount of output classes
model = tf.keras.models.Sequential([
  tf.keras.layers.Flatten(input_shape=(28, 28)),
  tf.keras.layers.Dense(128, activation='relu'),
  tf.keras.layers.Dropout(0.2),
  tf.keras.layers.Dense(aooc)
])

"""
Het model geeft een array terug met 10 logits.
"""
predictions = model(x_train[:1]).numpy()

"""
De softmax functie converteert deze logits naar de waarschijnlijkheid van elke class.
Kortom, van logits naar probabilities.
"""
tf.nn.softmax(predictions).numpy()

"""
De loss functie meet hoe goed het model voorspelt welke afbeelding bij welke class hoort.
"""
loss_fn = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)

"""
Aangezien een ongetraind model random voorspelt, zou elke class een gelijke probability hebben.
Deze intial loss kan berekend worden door het volgende te doen:
"""
initial_loss = tf.math.log(1/aooc) # Initial loss ~= 2.3

"""
Het model word hier gecompileerd en geconfigureerd zodat deze getraind kan worden.
Er wordt gekozen voor een Adam optimizer.
De metrics parameter geeft aan welke evaluatie criteria gebruikt worden om te bepalen hoe goed het model is.
"""
model.compile(optimizer='adam',
              loss=loss_fn,
              metrics=['accuracy'])

"""
Het model word hier getraind.
De epochs parameter geeft aan hoe vaak het model door de dataset heen gaat.
Hoe hoger deze waarde, hoe meer het model leert. Echter kan dit ook leiden tot overfitting. Hier moet je dus mee uitkijken.
"""
model.fit(x_train, y_train, epochs=5)

"""
We testen hier het model op de test dataset.
"""
model.evaluate(x_test,  y_test, verbose=2)

"""
Na 5 iteraties zien we het volgende resultaat
> 313/313 - 1s - loss: 0.0718 - accuracy: 0.9767 - 577ms/epoch - 2ms/step

Dit wilt zeggen dat het model een accuracy van 97.67% heeft
"""