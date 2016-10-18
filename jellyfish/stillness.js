const regl = require('regl')()
const mat4 = require('gl-mat4')
var rmat = []
const dis = require('../bits/jellydisplace.js')
const normals = require('angle-normals')
const camera = require('../bits/camera')(regl, {
  center: [0, 0, 0],
  distance: 10,
})
var glsl = require('glslify')

const drawdis = regl({
  frag: `
    precision mediump float;
    varying vec3 vnorm;
    vec3 hsl2rgb(vec3 hsl) {
      vec3 rgb = clamp( abs(mod(hsl.x*5.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
      return hsl.z - hsl.y * (rgb-0.5)*(3.0-abs(2.0*hsl.y-1.0));
    }
    void main () {
      gl_FragColor = vec4(hsl2rgb(abs(vnorm)), 1.0);
    }`,
  vert: glsl`
    precision mediump float;
    #pragma glslify: snoise = require('glsl-noise/simplex/3d')
    uniform mat4 model, projection, view;
    attribute vec3 position, normal;
    varying vec3 vnorm, vpos, dvpos;
    uniform float t;
    vec3 warp (vec3 p){
      float r = length(sin(p.yz));
      float theta = atan(p.z, p.x);
      return vec3 (r*cos(r), 2.0+sin(theta-r), r*sin(theta+t));
    }
    void main () {
      vnorm = normal;
      float h = min(
        pow(abs(((position.y)-1.0)*0.5),5.0),
        0.1
      );
      float dx =
      snoise(position+sin(t))*h;
      float dz =
      snoise(position+cos(t))*h;
      vpos = position;
      dvpos = position + vec3(dx,0,dz);
      gl_Position = projection * view * model * vec4(warp(dvpos),1);
    }`,
  attributes: {
    position: dis.positions,
    normal: normals(dis.cells, dis.positions)
  },
  elements: dis.cells,
  uniforms: {
    t: function(context, props){
         return context.tick/100
       },
    model: function(context, props){
      var theta = context.tick/60
      //return mat4.rotateZ(rmat, mat4.identity(rmat), theta)
      return mat4.identity(rmat)
    }
  },
  primitive: "lines"
})
regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => { drawdis() })
})
