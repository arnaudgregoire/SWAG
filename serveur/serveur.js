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

function str2bytes (str) {
    var bytes = new Uint8Array(str.length);
    for (var i=0; i<str.length; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}

function save_zip(data, name){
    var blob = new Blob([str2bytes(data)], {type: "application/zip"});
    saver.saveAs(blob, name + ".zip");
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

app.post('/',upload.array('zip'), function (req, res, next) {
  console.log('plop');
  console.log(req.body);
  fs.writeFileSync('lourd.zip',req.body );
})

app.listen(8080);
console.log("Serveur ouvert à l'adresse http://127.0.0.1:8080/");
//dezip()
