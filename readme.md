many [regl](http://regl.party) experiments.

###to run:

the below instructions are entered via command line (the
"terminal"). you will need to have
[node.js and npm](https://nodejs.org/en/download/)
installed for this to work.


first clone this repository to your own computer. 

run `npm install` in the repository directory.

run `budo index.js`

then point your browser to `localhost:9966`

###view other examples

to change which example is loaded, open `index.js` and 
in this section... 

```
var demos = [
  require('./jellyfish.js')(regl),
]
```

...change `jellyfish.js` to another file in the directory, like `cylwarp.js`.

save and then do `budo index.js` again and refresh
`localhost:9966`.

note: the files in the `bits` directory are pieces of code
that are used in the examples. these files won't run if you
put them directly into `index.js`.
