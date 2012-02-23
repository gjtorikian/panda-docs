var fs = require('fs'),
    util = require('util');

var Generator, 
    manifest = require('./manifest');

var jade = require('jade'),
    path = require('path'),
    wrench = require('wrench'), 
    helpers = require('./helpers'),
    async = require('async'),
    conrefs = require('markdown_conrefs');

Generator = module.exports;
var options = { }
exports.options = options;

  Generator.createGenerator = function(options, callback) {
    Generator.options = helpers.extend({
      assetsDir: options.assets,
      template: options.template,
    }, options);

    callback(null);
  }

  Generator.render = function(manifest, fn, filepath, file, srcContent, callback) {
    var _this = this;
    var _content = srcContent;
    var _file = file;

   replacedContent = markdown_conrefs.replaceConref(_content);
      // for easier access in Jade
      var content = helpers.markdown(_content);
      var metadata = content.metadata;
      content = content.html;

      var jadeParams = helpers.extend({
          options: this.options,
          manifest: manifest,
          content: content,
          metadata: metadata,
          outFile: file,
          whoAmI: filepath,
          markdown: helpers.markdown
       });

      var html = fn(jadeParams);
      
      fs.writeFile(_this.options.output + "/" + file + ".html", html, 'utf8', function(err) {
        callback(err);
      });
  };

  Generator.copyAssets = function(srcDir, destDir, callback) {
    wrench.mkdirSyncRecursive(destDir);
    wrench.copyDirSyncRecursive(srcDir, destDir);
    callback(null);
  };
