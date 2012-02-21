var fs = require('fs'),
    util = require('util'),
    path = require('path');

var Manifest = require('./lib/manifest'),
    Generator = require('./lib/generator');

var conrefs = require('markdown_conrefs'),
    async = require('async');

exports.Manifest = Manifest;
exports.Generator = Generator;

exports.open = function(filename, callback) {
  return Manifest.load(filename, callback);
};

exports.makeConrefs = function() {
  conrefs.init(Manifest.options.files);
};

exports.createGenerator = function(options, callback) {
  callback(null, Generator.create(options));
};

exports.copyAssets = function(srcDir, destDir) {
  console.log("Copying assets...");
  Generator.copyAssets(srcDir, destDir);
};

exports.generateFiles = function(callback) {
  Manifest.options.files.forEach(function(file) {
    fs.readFile(file, 'utf8', function(err, data) {
      if (err) {
        console.error("With file " + file + ": " + err);
        process.exit(0);
      }

      Generator.render(Manifest.options, file, path.basename(file, Manifest.options.extension), data);
    })
  });

  callback(null);
};