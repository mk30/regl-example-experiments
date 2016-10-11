var isosurface = require("isosurface")

function displacement (a, b, c){
  return Math.sin(a)*Math.sin(b*b)*Math.sin(c)
}

function sphere (y, z, x){
  return x*x + y*y + (z-5)*(z-5) - 20
}

var mesh = isosurface.surfaceNets([64,64,64],
  function (x, y, z){
    return sphere(x, y, z)+  
    displacement(x,1/y,z)/(1/y)*20
  }
  , [[-11,-11,-21], [11,21,11]])

module.exports = mesh
