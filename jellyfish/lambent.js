const regl = require('regl')()
const mat4 = require('gl-mat4')
const glsl = require('glslify')
const normals = require('angle-normals')

const camera = require('regl-camera')(regl, {
  center: [0, 3, 0],
  distance: 6 
})

function woman (regl){
  var rmat = []
  var mesh = require('./lambent.json')
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnormal;
      vec3 hsl2rgb(vec3 hsl) {
        vec3 rgb = clamp( abs(mod(hsl.x*5.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        return hsl.z - hsl.y * (rgb)*(10.0-abs(2.0*hsl.y-1.0));
      }

      void main () {
        gl_FragColor = vec4(hsl2rgb(abs(vnormal)), 1.0);
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
        gl_PointSize =
        (64.0*(1.0+sin(t*20.0+length(position))))/gl_Position.w;
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
        return mat4.rotateY(rmat, mat4.identity(rmat), 1.2)
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
      vec3 hsl2rgb(vec3 hsl) {
        vec3 rgb = clamp( abs(mod(hsl.x*5.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        return hsl.z - hsl.y * (rgb)*(10.0-abs(2.0*hsl.y-1.0));
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
        float r = length(p.x*sin(t*p.yz));
        float theta = atan(p.z, p.x);
        return vec3 (r*cos(theta), p.y*r*0.5, p.z*sin(theta));
      }
      void main () {
        vnorm = normal;
        float h = min(
          pow(abs(((position.y)-1.0)*0.5),6.0),
          0.2
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
        mat4.scale(model, model, [0.25, 0.2, 0.25])
        mat4.rotateY(model, model, 1.5) 
        mat4.translate(model, model, [0,10,-5])
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
