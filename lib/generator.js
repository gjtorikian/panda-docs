var fs = require('fs'),
    util = require('util');

var Generator, 
    manifest = require('./manifest');

var jade = require('jade'),
    path = require('path'),
    wrench = require('wrench'), 
    helpers = require('./helpers'),
    async = require('async');

Generator = module.exports;


  Generator.create = function(options) {
    this.options = helpers.extend({
      assetsDir: options.assets,
      template: options.template,
    }, options);
  }

  Generator.render = function(manifest, file, content, callback) {
    var _this = this;
    var _content = content;
    var _file = file;

    var jadeTemplateFile = path.resolve(this.options.template);
    
    fs.readFile(jadeTemplateFile, 'utf8', function(err, jadeTemplate) {
      var html;
      if (err) return callback(err);
      var fn = jade.compile(jadeTemplate, {filename: jadeTemplateFile, pretty: false});

      // for easier access in Jade
      var content = helpers.markdown(_content);
      var metadata = content.metadata;
      content = content.html;

      var jadeParams = helpers.extend({
          options: _this.options,
          manifest: manifest,
          content: content,
          metadata: metadata
      });

      html = fn(jadeParams);

      fs.writeFile(_this.options.output + "/" + file + ".html", html, 'utf8');

      callback(null, html);
    });
  };

  Generator.copyAssets = function(srcDir, destDir) {
    wrench.copyDirSyncRecursive(srcDir, destDir);
  };
