var fs = require('fs'),
    path = require('path');

var Manifest = require('./lib/manifest'),
    Generator = require('./lib/generator');

var conrefs = require('markdown_conrefs'),
    jade = require('jade'),
    async = require('async'),
    wrench = require('wrench');

//exports.Manifest = Manifest;
exports.Generator = Generator;

exports.open = function(filename, callback) {
  Manifest.open(filename, callback);
};

exports.makeConrefs = function(cb) {
  conrefs.init(Manifest.options.files);
  cb(null);
};

exports.createGenerator = function(options, callback) {
  Generator.createGenerator(options, callback);
};

exports.copyAssets = function(srcDir, destDir, callback) {
  console.log("Copying assets to " + destDir + "...");
  wrench.mkdirSyncRecursive(destDir, 0777);
  wrench.copyDirSyncRecursive(srcDir, destDir, {preserve: true});
  callback(null);
};

exports.copyResources = function(destDir, callback) {
  if (Manifest.options.resources !== undefined) {
      console.log("Copying resources...");
      var manifestDir = path.dirname(Manifest.uri);
  
      Manifest.options.resources.forEach(function (src) {
        var item = path.resolve(manifestDir, src);
        wrench.copyDirSyncRecursive(item, destDir + "/" + path.basename(item));
      });
      callback(null);
  } else {
    callback(null);
  }
};

exports.render = function(callback) {
  var jadeTemplateFile = Generator.options.template;
  var jadeTemplate = fs.readFileSync(jadeTemplateFile, 'utf8');
  var jadeCompileFn = jade.compile(jadeTemplate, {filename: jadeTemplateFile, pretty: false});
  console.log("Building files...");
  
  async.forEach(Manifest.options.files, function(file, cb) {
      fs.stat(file, function (err, stats) {
          if (err) return callback(err); 
          var mtime = stats.mtime;
          fs.readFile(file, 'utf8', function(err, data) {
              if (err) return callback(err); 
              Generator.render(Manifest.options, jadeCompileFn, file, path.basename(file, Manifest.options.extension), data, mtime, cb);
          });
      });  
  }, function(err, results) {
      callback(err);
  });
};