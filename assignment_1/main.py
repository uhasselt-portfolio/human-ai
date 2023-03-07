import tensorflow as tf

print("TensorFlow version:", tf.__version__)

"""
Laad de MNIST dataset.
Normaliseer de data van 0-255 naar 0-1.
Op deze manier worden de integers ook omgezet naar floats.
"""
dim = 255.0
mnist = tf.keras.datasets.mnist

(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / dim, x_test / dim

"""
Maak een sequentieel model.

Voeg een Flatten layer toe die een 2D input foto (28x28 pixels) omzet naar een 1D array.
De input die we binnenkrijgen, stelt een veld van pixels voor. Dit is een 2d array.
Aangezien we een neuraal netwerk hebben en een neuraal netwerk altijd werkt met een 1d array als input, moeten we de 2d array omzetten naar een 1d array.
De flatten layer gaat dit voor ons doen.

Voeg een Dense layer toe met 128 neuronen en een ReLU activatie functie.
Een activatiefunctie gaat de input-waarde vergelijken met een threshold waarde:
    - Als de input-waarde hoger is dan de threshold, dan zal de neuron geactiveerd worden (er wordt geen output naar de volgende layer gestuurd vanuit deze neuron).
    - Als de input-waarde lager is dan de threshold, dan zal de neuron niet geactiveerd worden.
Met de ReLu activatiefunctie, zal de neuron geactiveerd worden als de input-waarde hoger is dan 0. Wanneer deze negatief is, zal de neuron niet geactiveerd worden.
Dit wil zeggen dat de ReLu activatiefunctie een threshold heeft van 0.

Voeg een Dropout layer toe die willekeurig 20% van de input elementen op 0 zet tijdens de training.
Met een dropout layer gaan we proberen overfitting tegen te gaan, waarbij overfitting veroorzaakt wordt als het model te veel leert van de training data.
Een voorbeeld: stel we hebben 1000 neuronen in ons neuraal netwerk en een dropout van 20%, dan gaan willekeurig 200 neuronen in iedere iteratie op 0 staan.
Hoe lost dit overfitting op? Wanneer dit niet gebeurd, dan zal het model zich aanpassen aan de training data en zal het model niet goed kunnen generaliseren.
Door een dropout layer toe te voegen, zorgen we ervoor dat in iedere iteratie het neuraal netwerk een andere combinatie van neuronen gebruikt. Hierdoor gaan we het model dwingen om te generaliseren.

Voeg een Dense layer toe met 10 neuronen (1 voor elke class)
We doen aan clasiificatie, en kunnen onze data onderverdelen in 10 classes. Dit zorgt ervoor dat we in de output ook 10 neuronen nodig hebben, 1 voor elke class.

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

"""
Analyze and identify where the system makes assumptions that possibly could be wrong.

Het neurale netwerkt maakt assumpties gebasseerd op de data waarop deze getraind is. De accuratie van deze assumpties hangt af van de kwaliteit en hoeveelheid van trainingsdata.
In de bovenstaande code, kan het op verschillende plekken fout gaat:
    - Onvoldoende of gebiasde trainingsdata: wanneer er te weinig data is, of de data niet representatief is, wordt het model hier ook op getraind en gaat het aannemen dat dit de juiste data is.
    - Overfitting: wanneer het model te veel gaat leren, gaat het zich aanpassen aan de data en zal het heel moeilijk worden om nieuwe input te gaan voorspellen.
    - De opbouw van het neurale netwerk: wanneer verkeerde keuzes gemaakt worden, zoals bijvoorbeeld de activatiefunctie of de loss functie, kan dit het model gaan beinvloeden en uiteindelijk leiden tot een slechte voorspelling.
    - Opsplitsing trainingsdata en testdata: bij het trainen van een model, zullen we de data op moeten splitsen in een trainingsset en een testset. Dit is vaak een bepaald percentage van de totale dataset. 
      Als het nu toevallig is dat de trainingsset specifiek focust op een bepaalde class, dan kan het zijn dat het model zich hierop gaat aanpassen en niet goed kan generaliseren naar andere classes. 
 
"""