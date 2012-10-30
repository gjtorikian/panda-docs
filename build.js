var panda = require("./index");

var options = {
	title: "Panda (from script)",
	assets: "./templates/default/assets",
	outputAssets: "./out/assets"
}

panda.make(["./README.md"], options, function(err, cbReturn) {
	if (err) {
		console.error(err);
	}
});