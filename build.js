var panda = require("./bin/panda-docs");

panda.make(["./src/manifest.json", "-t", "Panda (from command line)"], function(err) {
    if (err) console.error(err);
});