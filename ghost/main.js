var regl = require('regl')()
var camera = require('regl-camera')(regl, {
  center: [0,0,0],
  distance: 5 
})
var anormals = require('angle-normals')
var mat4 = require('gl-mat4')
var spheremesh = require('sphere-mesh')
var fs = require('fs')
var snoise = fs.readFileSync(require.resolve('glsl-noise/simplex/3d.glsl'),'utf8')
var cnoise = fs.readFileSync(require.resolve('glsl-curl-noise/curl.glsl'),'utf8')

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
      uniform float time;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos;
      ${snoise}
      void main () {
        vnorm = normal;
        float dy = snoise(position+time*0.25);
        vpos = position + vec3(0,dy,0);
        gl_Position = projection * view * model * vec4(vpos,1);
      }
    `,
    attributes: {
      position: sphere.positions,
      normal: anormals(sphere.cells, sphere.positions)
    },
    uniforms: {
      model: function () {
        return mat4.identity(model)
      },
      time: regl.context('time')
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








