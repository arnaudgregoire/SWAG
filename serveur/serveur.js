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
const multer        = require('multer')
const JSZip         = require("jszip");

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

var storage = multer.diskStorage({
  destination: "./zip/",
  filename:  "wow"
})

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
function convertBinaryStringToUint8Array(str) {
  var arr = str.split(",").map(function (val) {
  return Number(val);
  })
  return new Uint8Array(arr)
}
