const regl = require('regl')()
const mat4 = require('gl-mat4')
var rmat = []
const cyl = require('./bits/implicitcyl.js')
const normals = require('angle-normals')
const camera = require('./bits/camera.js')(regl, {
  center: [0, 0, 0],
  distance: 15,
  phi: -0.6,
  theta: -0.7
})
var feedback = require('./bits/feedbackeffect.js')
var drawfeedback = feedback(regl, `
  vec3 sample (vec2 uv, sampler2D tex) {
    return 0.97*texture2D(tex, (0.99*(2.0*uv-1.0)+1.0)*0.5).rgb;
  }
`)
const feedBackTexture = regl.texture({})
const drawcyl = regl({
  frag: `
    precision mediump float;
    varying vec3 vnormal;
    vec3 hsl2rgb(vec3 hsl) {
      vec3 rgb = clamp( abs(mod(hsl.x*5.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
      return hsl.z - (rgb-0.5)*(3.0-abs(2.0*hsl.y-1.0));
    }
    void main () {
      gl_FragColor = vec4(hsl2rgb(abs(vnormal)), 0.3);
    }`,
  vert: `
    precision mediump float;
    uniform mat4 model, projection, view;
    attribute vec3 position, normal;
    varying vec3 vnormal;
    uniform float t;
    vec3 warp (vec3 p){
      float r = length(p.zx*sin(t*p.yz));
      float theta = atan(p.z, p.x);
      return vec3 ((1.0-r)*cos(theta), (p.y*2.0)/r+p.y, r*sin(theta+p.z));
    }
    void main () {
      vnormal = normal;
      gl_Position = projection * view * model * vec4(warp(position), 1.0);
      gl_PointSize =
      (64.0*(1.0+sin(t*20.0+length(position))))/gl_Position.w;
    }`,
  attributes: {
    position: cyl.positions,
    normal: normals(cyl.cells, cyl.positions)
  },
  elements: cyl.cells,
  uniforms: {
    t: function(context, props){
         return context.tick/1000
       },
    model: function(context, props){
      var theta = context.tick/60
      return mat4.rotateZ(rmat, mat4.identity(rmat), theta)
    }
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
  primitive: "points"
})
regl.frame(() => {
  regl.clear({ color: [0, 0, 0, 1] })
  drawfeedback({texture: feedBackTexture})
  camera(() => { 
    drawcyl() 
    feedBackTexture({    
      copy: true,
      min: 'linear',
      mag: 'linear'
    })
  })
})
