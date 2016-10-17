const regl = require('regl')()
const mat4 = require('gl-mat4')
var rmat = []

const skelly = require('./bits/skelly.json')
const normals = require('angle-normals')

const camera = require('./bits/camera.js')(regl, {
  center: [0, 0, 0]
})

const drawskelly = regl({
  frag: `
    precision mediump float;
    varying vec3 vnormal;
    vec3 hsl2rgb(vec3 v ) {
      vec3 rgb = clamp( abs(mod(v.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
      return v.z + v.y * (rgb-0.5)*(1.0-abs(2.0*v.z-1.0));
    }
    vec3 warpcolor (vec3 rgb){
      return vec3 (rgb.x+(rgb.x*rgb.y),rgb.y , rgb.z);
    }
    void main () {
      gl_FragColor = vec4(hsl2rgb(warpcolor(abs(vnormal))), 1.0);
    }`, 
  vert: `
    precision mediump float;
    uniform mat4 model, projection, view;
    attribute vec3 position, normal;
    varying vec3 vnormal;
    uniform float t;
    vec3 warp (vec3 p){
      float r = length(p.zx);
      float theta = atan(p.z, p.x);
      return vec3 (r*r*cos(theta), p.y, r*sin(theta)) +(1.0+cos(40.0*t+p.y));
    }
    void main () {
      vnormal = normal;
      gl_Position = projection * view * model *
      vec4(warp(position), 1.0);
      gl_PointSize =
      (64.0*(1.0+sin(t*20.0+length(position))))/gl_Position.w;
    }`,
  attributes: {
    position: skelly.positions,
    normal: normals(skelly.cells, skelly.positions)
  },
  elements: skelly.cells,
  uniforms: {
    t: function(context, props){
         return context.tick/1000
       },
    model: function(context, props){
      var theta = context.tick/60
      var inmat = mat4.translate(rmat, mat4.identity(rmat),
      [-50.0, -22.0, 0.0])
      return mat4.rotateY(rmat, inmat, theta)
    }
    
  },

  primitive: "triangles"
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    drawskelly()
  })
})
