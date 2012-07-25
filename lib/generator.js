var fs = require('fs');

var Generator, 
    tohGenerator = require('./toh');

var helpers = require('./helpers'),
    conrefs = require('markdown_conrefs');

Generator = module.exports;
var options = { };
exports.options = options;

Generator.createGenerator = function(options, callback) {
    Generator.options = helpers.extend({
        assetsDir: options.assets,
        template: options.template,
    }, options);

    callback(null);
}

Generator.render = function(manifest, jadeCompileFn, filepath, file, srcContent, mtime, callback) {
    var replacedContent = conrefs.replaceConref(srcContent);
    
    // for easier access in Jade
    var content = helpers.markdown(replacedContent);
    var metadata = content.metadata;
    content = content.html;
    
    var toh = tohGenerator.generate(replacedContent);
    content = tohGenerator.autoLinkifyHeaders(content);
    
    var jadeParams = helpers.extend({
      options: this.options,
      manifest: manifest,
      content: content,
      toh: toh,
      metadata: metadata,
      fileName: file,
      whoAmI: filepath,
      title: Generator.options.title,
      mtime: mtime
    });
    
    var html = jadeCompileFn(jadeParams);
    
    fs.writeFile(this.options.output + "/" + file + ".html", html, 'utf8', function(err) {
        return callback(err);
    });
};