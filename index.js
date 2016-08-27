var regl = require('regl')()
var demos = [ 
  require('./cylwarp.js')(regl),
]
const camera = require('./camera.js')(regl, {
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
