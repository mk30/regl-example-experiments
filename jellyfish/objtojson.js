var parseOBJ = require('parse-wavefront-obj');
var fs = require('fs');

var buf = fs.readFileSync('lambent.obj');
var mesh = parseOBJ(buf);
fs.writeFile('lambent.json', JSON.stringify(mesh), function (err){
  if (err) throw err;
  console.log('It\'s saved!');
});
