var regl = require('regl')()
var demos = [ 
  require('./jellyfish.js')(regl),
]
const camera = require('./bits/camera.js')(regl, {
  center: [0, 0, 0]
})


regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(() => {
    demos[0]() 
  })
})
