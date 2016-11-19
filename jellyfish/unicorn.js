const regl = require('regl')()
const mat4 = require('gl-mat4')
const glsl = require('glslify')
const normals = require('angle-normals')

const camera = require('regl-camera')(regl, {
  center: [0, 20, 0],
  distance: 50,
  theta: 1,
  delta: -.05
})

function woman (regl){
  var model = []
  var mesh = require('./unicorn.json')
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnormal;
      void main () {
        gl_FragColor = vec4(abs(vnormal), 1.0);
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
      model: function(context, props){
        var theta = context.tick/60
        mat4.identity(model)
        mat4.scale(model, model, [0.01, 0.01, 0.015])
        //mat4.rotateY(model, model, 1.5) 
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
  woman: woman(regl),
  wings: wings(regl)
}

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    draw.woman()
    draw.wings()
  })
})
