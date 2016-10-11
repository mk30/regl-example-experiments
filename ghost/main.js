var regl = require('regl')()
var camera = require('regl-camera')(regl, {
  center: [0,0,0],
  distance: 5,
  theta: -1.5 
})
var anormals = require('angle-normals')
var mat4 = require('gl-mat4')
var icosphere = require('icosphere')
var fs = require('fs')
var snoise = fs.readFileSync(require.resolve('glsl-noise/simplex/3d.glsl'),'utf8')
var cnoise = fs.readFileSync(require.resolve('glsl-curl-noise/curl.glsl'),'utf8')

const feedBackTexture = regl.texture({
  copy: true,
  min: 'linear',
  mag: 'linear'
})
function makesphere (regl) {
  var sphere = icosphere(4)
  var model = []
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vpos, vnorm;
      ${snoise}
      ${cnoise}
      void main () {
        float c = snoise(curlNoise(sin(vpos+3.0)/2.0));
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
        vec4(sqrt(vec3(1,0.8,0.3)*(c+0.7)),0.9);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view, model;
      uniform float time;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos, dvpos;
      ${snoise}
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
        //mat4.translate(model, model, [-32,-32,-32])
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
    elements: sphere.cells
  })
}
const drawFeedback = regl({
  frag: `
  precision mediump float;
  uniform sampler2D texture;
  uniform float t;
  varying vec2 uv;
  void main () {
    vec2 warp = uv + 0.01 * sin(t) * vec2(0.5 - uv.y, uv.x - 0.5)
      - 0.01 * (uv - 0.5);
    gl_FragColor = vec4(0.98 * texture2D(texture, warp).rgb, 1);
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`,

  attributes: {
    position: [-2, 0, 0, -2, 2, 2]
  },

  uniforms: {
    texture: feedBackTexture,
    t: ({tick}) => 0.001 * tick
  },

  depth: {enable: false},

  count: 3
})

var draw = {
  sphere: makesphere(regl)
}

regl.frame(function () {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () {
    drawFeedback()
    draw.sphere()
    feedBackTexture({
      copy: true,
      min: 'linear',
      mag: 'linear'
    })

  })
})
