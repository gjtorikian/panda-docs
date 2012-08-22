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

Generator.render = function(manifest, jadeCompileFn, filepath, filename, srcContent, mtime, callback) {
    var replacedContent = conrefs.replaceConref(srcContent);
    
    var toh = tohGenerator.generate(replacedContent);
    var found = false;
    
    // check for H1 tag
    for (var h = 0; h < toh.length; h++) {
        var heading = toh[h];
        if (heading.rank == 1) {
            if (found) {
                callback("ERROR: In " + filename + ", you have more than one H1 tag.");    
            }
            else {
                found = heading;
            }
        }
    }
    
    if (!found) {
        callback("ERROR: In " + filename + ", I could not find an H1 tag. We need this to generate the page's title.");    
    }
   
    // remove h1 now 
    if (!this.options.keepFirstHeader) {
        replacedContent = replacedContent.replace(found.text, "");
    }
    
    // for access in Jade
    var content = helpers.markdown(replacedContent);
    
    var metadata = content.metadata;
    content = content.html;
    
    content = tohGenerator.autoLinkifyHeaders(content);
    
    var jadeParams = helpers.extend({
      options: this.options,
      manifest: manifest,
      content: content,
      toh: toh,
      headingTable: tohGenerator.headingTable,
      metadata: metadata,
      fileName: filename,
      whoAmI: filepath,
      title: Generator.options.title,
      pageTitle: found.name,
      mtime: mtime
    });
    
    var html = jadeCompileFn(jadeParams);
    
    fs.writeFile(this.options.output + "/" + filename + ".html", html, 'utf8', function(err) {
        return callback(err);
    });
};