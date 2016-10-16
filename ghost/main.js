var regl = require('regl')()
var camera = require('regl-camera')(regl, {
  center: [0,0,0],
  distance: 5,
  phi: 0.5,
  theta: 1.5
})
var anormals = require('angle-normals')
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')
var glsl = require('glslify')

var feedback = require('../bits/feedbackeffect.js')
var drawfeedback = feedback(regl, `
  vec3 sample (vec2 uv, sampler2D tex) {
    return 0.95*texture2D(tex, (0.99*(2.0*uv-1.0)+1.0)*0.5).rgb;
  }
`)
const feedBackTexture = regl.texture({})
function makesphere (regl) {
  var sphere = icosphere(4)
  var model = []
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      #pragma glslify: cnoise = require('glsl-curl-noise')
      varying vec3 vpos, vnorm;
      void main () {
        float c = snoise(cnoise(sin(vpos+3.0)/2.0));
        float y = vpos.y*11.0-7.6;
        float x = vpos.x/25.0;
        float z = vpos.z*14.0+9.0;
        float e = x*x
          + y*y
          + z*z
          +z*z*z*z
          +z*z*x*x
          +x*x
          - 0.1; 
        if (e < 0.0){
          gl_FragColor = vec4(sqrt(vec3(0,0,0)),1.0);
        }
        else gl_FragColor =
        vec4(sqrt(vec3(1,0.8,0.3)*(c+0.7)),0.1);
      }
    `,
    vert: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      uniform mat4 projection, view, model;
      uniform float time;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos, dvpos;
      void main () {
        vnorm = normal;
        float h = min(
          pow(abs(((position.y/0.5)-1.0)*0.5),3.0),
          0.9
        );
        float dx =
        snoise(position+sin(0.2*time-h))*h;
        float dz =
        snoise(position+cos(0.3*time-h))*h;
        vpos = position;
        dvpos = position
          + vec3(dx,0,dz)
          + vec3(0,position.y/12.0-sin(time*1.4)*0.007,position.z/12.0
          + sin(time)*0.1);
        gl_Position = projection * view * model * vec4(dvpos,1);
      }
    `,
    attributes: {
      position: sphere.positions,
      normal: anormals(sphere.cells, sphere.positions)
    },
    uniforms: {
      texture: feedBackTexture,
      model: function () {
        mat4.identity(model)
        mat4.scale(model, model, [0.5,1.5,0.5])
        return model
      },
      time: regl.context('time')
    },
    blend: {
      enable: true,
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha'
      }
    },
    cull: {
      enable: true
    },
    elements: sphere.cells
  })
}
var draw = {
  sphere: makesphere(regl)
}
regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  drawfeedback({texture: feedBackTexture})    //**
  camera(function () {
    draw.sphere()
    feedBackTexture({    //**
      copy: true,
      min: 'linear',
      mag: 'linear'
    })
  })
})
