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
      ${snoise}
      ${cnoise}
      void main () {
        float c = snoise(curlNoise(vpos));
        gl_FragColor = vec4(sqrt(vec3(1,0.8,0.5)*(c+1.0)),0.5);
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
        float h = min(
          pow(abs(((position.y/0.25)-1.0)*0.5),5.0),
          0.8
        );
        float dx = snoise(position+sin(time-h))*h;
        float dz = snoise(position+vec3(0,0,sin(time*h/2.0)));
        float dy = snoise(vec3(sin(time), sin(time),
        sin(time)));
        vpos = position + vec3(dx,0,dx);
        gl_Position = projection * view * model * vec4(vpos,1);
      }
    `,
    attributes: {
      position: sphere.positions,
      normal: anormals(sphere.cells, sphere.positions)
    },
    uniforms: {
      model: function () {
        mat4.identity(model)
        mat4.scale(model, model, [1,3,1])
        //mat4.translate(model, model, [-32,-32,-32])
        return model
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








