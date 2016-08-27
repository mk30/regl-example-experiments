var isosurface = require("isosurface")
var glvec2 = require("gl-vec2")
var out = []
var sum = []
var aa = []
var bb = []
var cc = []
var storage

function sdCyl( a, b ) { //a should be a vec3, b should be a vec2
  if (a[2] < -15) return 100;
  glvec2.subtract(out, [Math.abs(glvec2.length([a[0], a[2]])), Math.abs(a[1])], b);
  aa = Math.max(out[0], out[1])
  bb = Math.min(aa, 0.0)
  glvec2.max(cc, [out[0], out[1]], [0.0, 0.0]) 
  storage = bb + Math.abs(cc[1] - cc[0])
  return bb + Math.abs(cc[1] - cc[0])
}

var mesh = isosurface.surfaceNets([64,64,64],
  function (x, y, z){
    return sdCyl([x,y,z], [5, 1])
  }
  , [[-11,-11,-11], [11,11,11]])

module.exports = mesh
