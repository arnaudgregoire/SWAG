# Documentation programmeur Serveur Node

Ici sont documentés les différentes fonctions qui composent le serveur Node

 - dezip
 - python_call
 - save
 - convertBinaryStringToUint8Array

## dezip

Paramètre :


 - name {string} : nom du fichier à dézipper


 Description :

 Dézipe le l'archive avec le nom "name.zip" et enregistre les différents fichiers contenus dans l'archive dans le sous répertoire python/shp


## python_call

Paramètres :


*  name {name} - le nom du zip/fichier envoyé par le client
*  operation {string} - Le nom de l'opération demandé par le client


 Description :

Exécution d'une ligne de commande et envoi du retour au client

## save

Paramètres :


*  data {Uint8Array} - Le contenu du .zip transmis par le client
*  name {name} - le nom du zip/fichier envoyé par le client
*  operation {string} - Le nom de l'opération demandé par le client


 Description :

Fonction de sauvegarde du .zip sur le serveur, elle fait ensuite appel aux fonctions dezip & python_call

## convertBinaryStringToUint8Array

Paramètres :


*  str {str} - La chaine de caractère contenant les données du .zip

Retour :

*  {Uint8Array} - Cette même chaîne de caractère en format Uint


 Description :

Transformation de chaine de caractère contenus dans le formdata en matrice Uint8array
