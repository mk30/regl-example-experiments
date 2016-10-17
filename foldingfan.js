const regl = require('regl')()
const mat4 = require('gl-mat4')
const mod = require('./bits/foldingfanmodule.js')(regl)
const camera = require('./bits/camera.js')(regl, {
  center: [0.0, 2.5, 0.0]
})
const SetupCamera = regl  

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => { mod() })
})
