var panda = require("./bin/panda-docs");

panda.make(["./src/manifest.json", "-t", "Panda (from script)"], function(err) {
	if (err !== undefined) {
		console.error(err);
	}
});