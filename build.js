var panda = require("./bin/panda-docs");

var options = {
	title: "Panda (from script)"
}

panda.make("./src/manifest.json", options, function(err) {
	if (err) {
		console.error(err);
	}
});