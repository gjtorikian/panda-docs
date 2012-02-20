var panda = require("panda-docs/bin/panda-docs");

panda.main(["./src/manifest.json", "-t", "Panda (from command line)"], function(err) {
    if (err) console.error(err);
});