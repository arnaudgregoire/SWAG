/*
les différentes librairies utilisées
http            : pour créer le serveur
express         : pour faciliter l'écriture bas niveau de node
url             : Avoir le nom de l'url
querystring     : faire un dictionnaire à partir des arguments passés en GET dans l'url
*/
const http          = require('http');
const express       = require('express');
const url           = require('url');
const querystring   = require('querystring');
const app           = express();
const execFile      = require('child_process').execFile;
const fs            = require('fs')
const unzip         = require('unzip2')
const bodyParser    = require('body-parser')
const multer        = require('multer')
const saver         = require('file-saver')
const JSZip         = require("jszip");
const tou8          = require('buffer-to-uint8array');

function dezip() {
    fs.createReadStream('emprise_1854.zip').pipe(unzip.Extract({ path: 'shp' }));
}

function python_call() {
  const child = execFile('python', ['test.py','shp/bloub.txt'], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
}

var storage = multer.diskStorage({
  destination: "./zip/",
  filename:  "wow"
})

var upload = multer( { limits: {
    fieldNameSize: 999999999,
    fieldSize: 999999999
  },
    storage : storage})

app.post('/',upload.single('zip'), function (req, res, next) {
  console.log('plop');
  console.log(req.body);
  console.log(typeof(req.body.zip));
  var data = tou8(req.body.zip);
  console.log(data);
  console.log(typeof(data));
  save(req.body.zip)
})

app.listen(8080);
console.log("Serveur ouvert à l'adresse http://127.0.0.1:8080/");
//dezip()

function save(data) {
    var zip = new JSZip();
    zip.loadAsync(data,{type : "uint8array"})
    .then(function(zip) {
    // you now have every files contained in the loaded zip
    zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream('out.zip'))
    .on('finish', function () {
        // JSZip generates a readable stream with a "end" event,
        // but is piped here in a writable stream which emits a "finish" event.
        console.log("out.zip written.");
    });
    });

}
