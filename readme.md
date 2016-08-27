many [regl](http://regl.party) experiments.

###to run:

`npm install`

`budo index.js`

then point your browser to `localhost:9966`

the default example loaded is `cylwarp.js`.

###view other examples

to change which example is loaded, open `index.js` and 
in this section... 

```
var demos = [
  require('./cylwarp.js')(regl),
]

```

...change `cylwarp.js` to another file in the directory, like `jellyfish.js`.

save and then do `budo index.js` again and refresh
`localhost:9966`.
