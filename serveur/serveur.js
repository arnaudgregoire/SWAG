const execFile = require('child_process').execFile;
const fs       = require('fs')
const unzip    = require('unzip')

//fs.createReadStream('bloub.zip').pipe(unzip.Extract({ path: 'shp' }));

const child = execFile('python', ['test.py','shp/bloub.txt'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});	