var fs = require('fs');

var Generator, 
    tohGenerator = require('./toh');

var helpers = require('./helpers'),
    conrefs = require('markdown_conrefs');

Generator = module.exports;

Generator.render = function(options, jadeCompileFn, filepath, filename, srcContent, mtime, callback) {
    var replacedContent = conrefs.replaceConref(srcContent);
    
    var toh = tohGenerator.generate(replacedContent);
    var found = false;
    
    // check for H1 tag
    for (var h = 0; h < toh.length; h++) {
        var heading = toh[h];
        if (heading.rank == 1) {
            found = heading;
            break;
        }
    }
    
    if (!found) {
        callback("ERROR: In " + filename + ", I could not find an H1 tag. We need this to generate the page's title.");    
    }
   
    // remove h1 now 
    if (!options.keepFirstHeader) {
        replacedContent = replacedContent.replace(found.text, "");
    }
    
    // for access in Jade
    var content = helpers.markdown(replacedContent);
    
    var metadata = content.metadata;
    content = content.html;
    
    content = tohGenerator.autoLinkifyHeaders(content);
    
    var jadeParams = {};
    jadeParams = helpers.extend(options, {
      content: content,
      toh: toh,
      headingTable: tohGenerator.headingTable,
      metadata: metadata,
      fileName: filename,
      whoAmI: filepath,
      pageTitle: found.name,
      mtime: mtime,
      markdown: helpers.markdown
    });
    
    var html = jadeCompileFn(jadeParams);
    
    fs.writeFile(options.output + "/" + filename + ".html", html, 'utf8', function(err) {
        callback(err, html);
    });
};