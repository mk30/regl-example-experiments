var regl = require('regl')()
var camera = require('regl-camera')(regl, {
  center: [0,0,0],
  distance: 5 
})
var anormals = require('angle-normals')
var mat4 = require('gl-mat4')
var spheremesh = require('sphere-mesh')

function makesphere (regl) {
  var sphere = spheremesh(20,0.25)
  var model = []
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vpos, vnorm;
      void main () {
        float l = max(dot(vec3(0.2,1,-0.3),vnorm)*0.8,
          dot(vec3(-0.3,-1,-0.2),vnorm)*0.05);
        gl_FragColor = vec4(l,l,l,1);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view, model;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos;
      void main () {
        vnorm = normal;
        vpos = position;
        gl_Position = projection * view * model * vec4(position,1);
      }
    `,
    attributes: {
      position: sphere.positions,
      normal: anormals(sphere.cells, sphere.positions)
    },
    uniforms: {
      model: function () {
        return mat4.identity(model)
      }
    },
    elements: sphere.cells
  })
}

var draw = {
  sphere: makesphere(regl)
}

regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () {
    draw.sphere()
  })
})








