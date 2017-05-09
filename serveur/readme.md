# Serveur Node
## Présentation
Le serveur Node.js permet de faire le lien entre le client et le python.
Il réalise les opérations suivantes :

 - Réception des données qu'envoie le client (.zip) sous forme d'un string
 - Conversion de la chaine de caractère en .zip
 - Enregistrement du .zip coté serveur
 - Ouverture du .zip et enregistrement des données dézipées dans le dossier python.shp
 - Exécution de la commande python demandé par le client
 - Réception de la réponse python
 - Envoi de la réponse python au client

## Installation

Veuillez télécharger et installer node à l'adresse suivante :

https://nodejs.org/en/

Si vous travaillez derrière un proxy (comme à l'ENSG), ouvrez un invite de commande pour configurer le proxy :
```sh
npm config set proxy http://10.0.4.2:3128
npm config set https-proxy http://10.0.4.2:3128
```

Pour installer le node, ouvrez un invite de commande dans le dossier SWAG et tapez :

```sh
$ cd serveur
$ npm install
```

npm va installer dans un sous-dossier node-modules les modules suivants :

 -  http        : pour créer le serveur
 -  express     : pour faciliter l'écriture bas niveau de node
 -  url         : Avoir le nom de l'url
 -  querystring : faire un dictionnaire à partir des arguments passés en GET dans l'url
 -  execFile    : pouvoir éxécuter un fichier en ligne de commande (ici .py)
 -  fs          : pouvoir écrire sur le disque un fichier (ici .zip et .shp)
 -  unzip2      : permet de déziper le .zip écrit sur le fichier
 -  multer      : permet de gérer la réception des formdata
 -  JSZip       : permet la compréhension et l'écriture de zip

## Lancement du serveur

Un fois les modules téléchargés, vous pouvez lancer le serveur via la commande :

```sh
$ node serveur.js
```

## Analyse de la console serveur
Le serveur signale son lancement à l'utilisateur par la phrase :

```sh
Serveur ouvert à l'adresse http://127.0.0.1:8080/
```

Lors du chargement d'un zip par le client, le serveur affiche un message type :

```sh
basics
zip/1854_emprise.zip written.
Extracted zip/1854_emprise.zip in folder python/shp.
```
"basics" représente l'opération que le python doit réaliser.
node exécute alors la commande correspondante et l'écrit dans la console
### Exemples :
```sh
python  python/swag.py  python//shp//1854_emprise.shp basics
```
```sh
python  python/swag.py  python//shp//1854_emprise.shp average_shortest_path_length
```

Le serveur écrit ensuite le retour que lui a envoyé python
### Exemples :
```sh
{"basics":{"nb_nodes" : 3205, "nb_edges" : 5073, "total_length" : 504332}}
```
```sh
{"average_shortest_path_length" : 3037.9637242716376}
```
Une fois que le serveur a envoyé le retour python au client, il affiche :
```sh
envoi des données au client
```
## Documentation utilisateur
Pour aider l'utilisateur, les fonctions du script serveur.js ont été documentées.
La documentation est disponible :

-  dans les commentaires du fichier script.js
-  dans le dossier doc sous la forme de pages internet (généré par jsdoc)
