const regl = require('regl')()
const mat4 = require('gl-mat4')
const vec3 = require('gl-vec3')
const glsl = require('glslify')
const normals = require('angle-normals')

const camera = require('regl-camera')(regl, {
  center: [0, 20, 0],
  distance: 50,
  theta: 1
})
var suits = { single: [], many: [] }
for (var i = 0; i < 20; i++) {
  var theta = Math.random() * 2 * Math.PI
  var phi = Math.random() * 2 * Math.PI
  var r = Math.random() * 10 + 3
  suits.many.push({
    init: [ Math.cos(theta)*r, Math.sin(phi)*r, Math.sin(theta)*r ],
    rspeed: Math.exp(Math.random()*3-2),
    speed: Math.exp(Math.random()-4),
    vector: vec3.random([]),
    axis: vec3.random([])
  })
}
suits.single.push({
  init: [4.6,-1,-2],
  rspeed: 2,
  speed: 0,
  vector: [0,0,-1],
  //axis: [1,0.1,0]
  axis: vec3.random([])
})
function unicorn (regl){
  var model = [], vtmp = []
  var mesh = require('./unicorn.json')
  var cells = []; 
  for (var i = 0; i < mesh.cells.length; i++) { 
    var c = mesh.cells[i]; 
    for (var j = 2; j < c.length; j++) { 
      cells.push([c[0],c[j-1],c[j]])
    } 
  }
  mesh.cells = cells
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnormal, vpos;
      varying float vtime;
      vec3 hsl2rgb(in vec3 hsl) {
        vec3 rgb = clamp(abs(mod(hsl.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
        return hsl.z+hsl.y*(rgb-0.5)*(1.0-abs(2.0*hsl.z-1.0));
      }
      void main () {
        vec3 c = abs(vnormal) * 0.3
          + vec3(10.0*sin(vtime - vpos.z/10.0 +
          vpos.y/200.0),1,1) * 0.4
        ;
        c.y = 1.0;
        gl_FragColor = vec4(hsl2rgb(c), 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      uniform float t;
      uniform vec3 offset;
      attribute vec3 position, normal;
      varying vec3 vnormal, vpos;
      varying float vtime;
      void main () {
        vnormal = normal;
        vtime = t;
        gl_Position = projection * view * model *
        vec4(position+offset, 1.0);
        vpos = vec3(gl_Position);
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
      offset: function (context, props) {
        vec3.copy(vtmp, props.vector)
        vec3.scale(vtmp, vtmp, props.speed*context.time*20.0)
        vec3.add(vtmp, props.init, vtmp)
        return vtmp
      },
      model: function(context, props){
        var theta = context.tick/60
        mat4.identity(model)
        mat4.scale(model, model, [0.01, 0.01, 0.015])
        mat4.rotate(model, model, props.rspeed *
        context.time * 0.1, props.axis) 
        return model
      }
    },
    primitive: "triangles"
  })
}
function wings (regl){
  var model = []
  var mesh = require('../bits/jellydisplace.js')
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnorm;
      void main () {
        gl_FragColor = vec4(abs(vnorm), 1.0);
      }`,
    vert: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      uniform mat4 model, projection, view;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos, dvpos;
      uniform float t;
      vec3 warp (vec3 p){
        float r = length(p.x*sin(p.yz));
        float theta = atan(p.z, p.x);
        return vec3 (r*cos(theta), p.y*r*0.5, p.z*sin(theta));
      }
      void main () {
        vnorm = normal;
        float dx =
        snoise(position+sin(t-position));
        float dz =
        snoise(position+cos(t-position));
        vpos = position;
        dvpos = position + vec3(dx,0,dz);
        gl_Position = projection * view * model * vec4(warp(dvpos),1);
      }`,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      t: function(context, props){
           return context.tick/100
         },
      model: function(context, props){
        var theta = context.tick/60
        mat4.identity(model)
        mat4.scale(model, model, [1.5, 1.3, 2.0])
        mat4.rotateY(model, model, -1.5) 
        mat4.translate(model, model, [0,13,-1.0])
        return model
      }
    },
    primitive: "triangles"
  })
}
var draw = {
  unicorn: unicorn(regl),
  wings: wings(regl)
}
regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    draw.unicorn(suits.many)
    draw.wings()
  })
})
