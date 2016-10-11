//takes a function for an implicit sphere with a
//displacement and exports the mesh
var isosurface = require("isosurface")

function displacement (a, b, c){
  return 20*Math.sin(40*a)*Math.sin(60*b)*Math.sin(100*c)
}

function sphere (y, z, x){
  return x*x + y*y + (z-3)*(z-3) - 10
}

var mesh = isosurface.surfaceNets([64,64,64],
  function (x, y, z){
    return sphere(x, y, z) + displacement(x,y,z)
  }
  , [[-11,-11,-21], [11,21,11]])

module.exports = mesh
