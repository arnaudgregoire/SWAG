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
function dezip() {
    fs.createReadStream('zip/out.zip').pipe(unzip.Extract({ path: 'shp' }));
}

function python_call() {
  const child = execFile('python', ['test.py','shp/bloub.txt'], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
}

var upload = multer( { limits:
  {
    fieldNameSize: 999999999,
    fieldSize: 999999999
  }})

app.post('/',upload.single('zip'), function (req, res, next) {
  var data = convertBinaryStringToUint8Array(req.body.zip)
  console.log(data);
  console.log(typeof(data));
  console.log(data.length);
  save(data)
})

app.listen(8080);
console.log("Serveur ouvert à l'adresse http://127.0.0.1:8080/");
//dezip()

/**
* Fonction de sauvegarde du .zip sur le serveur & des fichiers shp & co associé
* @param data {Uint8Array} - Le contenu du .zip transmis par le client
*/
function save(data) {
    var zip = new JSZip();
    zip.loadAsync(data).then(function () {
      zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
      .pipe(fs.createWriteStream('zip/out.zip'))
      .on('finish', function () {
          console.log("out.zip written.");
          dezip()
      });
    });

}

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
