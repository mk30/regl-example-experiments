const regl = require('regl')()
const mat4 = require('gl-mat4')

const normals = require('angle-normals')

const camera = require('regl-camera')(regl, {
  center: [0, 2.5, 0],
  distance: 5 
})

function woman (regl){
  var rmat = []
  var mesh = require('./lambent.json')
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnormal;
      void main () {
        gl_FragColor = vec4(vnormal, 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      attribute vec3 position, normal;
      varying vec3 vnormal;
      uniform float t;
      void main () {
        vnormal = normal;
        gl_Position = projection * view * model *
        vec4(position, 1.0);
        gl_PointSize =
        (64.0*(1.0+sin(t*20.0+length(position))))/gl_Position.w;
      }`,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      t: function(context, props){
           return context.tick/1000
         },
      model: mat4.identity([]),
      /*
      model: function(context, props){
        var theta = context.tick/60

        return mat4.rotateY(rmat, mat4.identity(rmat), theta)
      }
      */
    },
    primitive: "points"
  })
}

var draw = {
  woman: woman(regl)
}


regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    draw.woman()
  })
})
