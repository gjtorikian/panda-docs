var fs = require('fs'),
    util = require('util'),
    path = require('path');

var Manifest = require('./lib/manifest'),
    Generator = require('./lib/generator');

var conrefs = require('markdown_conrefs'),
    jade = require('jade'),
    async = require('async');

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
  console.log("Copying assets...");
  Generator.copyAssets(srcDir, destDir, callback);
};

exports.render = function(callback) {
  var jadeTemplateFile = Generator.options.template;
  var jadeTemplate = fs.readFileSync(jadeTemplateFile, 'utf8');
  var fn = jade.compile(jadeTemplate, {filename: jadeTemplateFile, pretty: false});

  async.forEach(Manifest.options.files, function(file, cb) {
    var data = fs.readFileSync(file, 'utf8');//, function(err, data) {
    Generator.render(Manifest.options, fn, file, path.basename(file, Manifest.options.extension), data, cb);
  }, function(err, results) {
    callback(err);
  });
};