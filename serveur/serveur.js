/**
 * @fileOverview Projet Jeu du taquin
 * @author Arnaud Grégoire <arnaud.gregoire@ensg.eu>
 * @see <a href="https://github.com/arnaudgregoire/SWAG">https://github.com/arnaudgregoire/SWAG</a>
 *@requires http        : pour créer le serveur
 *@requires express     : pour faciliter l'écriture bas niveau de node
 *@requires url         : Avoir le nom de l'url
 *@requires querystring : faire un dictionnaire à partir des arguments passés en GET dans l'url
 *@requires execFile    : pouvoir éxécuter un fichier en ligne de commande (ici .py)
 *@requires fs          : pouvoir écrire sur le disque un fichier (ici .zip et .shp)
 *@requires unzip2      : permet de déziper le .zip écrit sur le fichier
 *@requires multer      : permet de gérer la réception des formdata
 *@requires JSZip       : permet la compréhension et l'écriture de zip
*/
const http          = require('http');
const express       = require('express');
const url           = require('url');
const querystring   = require('querystring');
const app           = express();
const execFile      = require('child_process').execFile;
const fs            = require('fs')
const unzip         = require('unzip2')
const multer        = require('multer')
const JSZip         = require("jszip");
/**
 * Dezip le fichier out.zip contenu dans le dossier zip et écrit son contenu dans le dossier shp
 */
function dezip(name) {
    fs.createReadStream('zip/' + name + '.zip').pipe(unzip.Extract({ path: 'python/shp' }));
    console.log("Extracted " + 'zip/' + name + '.zip' + " in folder python/shp.");
}



var upload = multer( { limits:
  {
    fieldNameSize: 999999999,
    fieldSize: 999999999
  }})

app.post('/',upload.single('zip'), function (req, res, next) {
  var data      = ''
  var name      = req.body.name
  var operation = req.body.operation

  console.log(req.body.operation);

  res.setHeader('Access-Control-Allow-Origin', '*');

  /**
  * @function
  * @name python_call
  * @description Fonction de sauvegarde du .zip sur le serveur & des fichiers shp & co associé
  * @param data {Uint8Array} - Le contenu du .zip transmis par le client
  * @param name {name} - le nom du zip/fichier envoyé par le client
  * @param operation {string} - Le nom de l'opération demandé par le client
  */

  function python_call(name, operation) {
    var result_json = ""
    console.log('python ' + ' python/swag.py ' + ' python//shp//' + name + '.shp' + " " + operation );
    const child = execFile('python', ['python/swag.py','python//shp//' + name + '.shp', operation ], (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      var result_json = stdout
      console.log(result_json);
      res.send(result_json)
      console.log("envoi des données au client");
    });
  }

/**
* @function
* @name save
* @description Fonction de sauvegarde du .zip sur le serveur & des fichiers shp & co associé
* @param data {Uint8Array} - Le contenu du .zip transmis par le client
* @param name {name} - le nom du zip/fichier envoyé par le client
* @param operation {string} - Le nom de l'opération demandé par le client
*/

  function save(data,name,operation) {
      var zip = new JSZip();
      zip.loadAsync(data).then(function () {
        zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream('zip/' + name + '.zip'))
        .on('finish', function () {
            console.log('zip/' + name + '.zip' + " written.");
            dezip(name)
            python_call(name, operation)
        });
      });
  }



  if (typeof(req.body.zip) !== 'undefined'){
      data = convertBinaryStringToUint8Array(req.body.zip)
      save(data,name,operation)
  }
  else {
    python_call(name,operation)
  }
})

app.listen(8080);
console.log("Serveur ouvert à l'adresse http://127.0.0.1:8080/");
//dezip()



/**
* Transformation de chaine de caractère contenus dans le formdata en matrice Uint8array
* @param str {str} - La chaine de caractère contenant les données du .zip
* @return {Uint8Array} - Cette même chaîne de caractère en format Uint
*/
function convertBinaryStringToUint8Array(str) {
  var arr = str.split(",").map(function (val) {
  return Number(val);
  })
  return new Uint8Array(arr)
}
