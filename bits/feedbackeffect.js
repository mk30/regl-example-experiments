module.exports = function(regl, src){
  return regl({
    frag: `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D tex;
      ${src}
      void main () {
        gl_FragColor = vec4(sample(uv, tex),1);
      }
    `,
    vert: `
    precision mediump float;
    varying vec2 uv;
    attribute vec2 position;
    void main () {
      uv = (1.0+position)*0.5;
      gl_Position = vec4(position, 0, 1);
    }`,
    attributes: {
      position: [-4, 0, 0, -4, 4, 4]
    },
    uniforms: {
      tex: regl.prop('texture'),
    },
    depth: {enable: false},
    count: 3
  })
}
