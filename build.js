var panda = require("./bin/panda-docs");

var options = {
	title: "Panda (from script)"
}

panda.make("./src/manifest.json", options, function(err, cbReturn) {
	if (err) {
		console.error(err);
	}
});