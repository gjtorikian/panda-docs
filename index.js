var fs = require('fs'),
    path = require('path');

var Generator = require('./lib/generator'),
    helpers = require('./lib/helpers'),
    cli = require('./lib/cli');

var conrefs = require('markdown_conrefs'),
    jade = require('jade'),
    wrench = require('wrench'),
    funcDocs = require('functional-docs'),
    async = require('async'),
    cheerio = require('cheerio'),
    _ = require("underscore");

var panda_docs = exports;
var files;

panda_docs.make = exports.make = function(paths, _options, callback) {
    var options = cli.parseArgs(paths);

    for (var key in _options) {
      if (_options.hasOwnProperty(key)) {
        options[key] = _options[key];
      }
    }

    destDir = options.output;

    if (!options.keepOutDir) {
      wrench.rmdirSyncRecursive(destDir, true);
    }

    wrench.mkdirSyncRecursive(destDir);

    cbReturn = {};
    cbReturn.files = [ ];

    async.series([
        function(cb) {
          if (options.extension.charAt(0) !== ".")
            options.extension = "." + options.extension;

          cli.findFiles(options.paths, options.excludes, options.extension, function(err, _files) {
            files = _files;
            cb(err);
          });
        },

        function(cb) {
          conrefs.init(files);
          cb(null);
        },

        function(cb) {
          if (options.assets) {
            var outAssetsDirName = options.outputAssets || path.join(options.output, path.basename(options.assets));

            console.log("Copying assets to " + outAssetsDirName + "...");
            wrench.mkdirSyncRecursive(outAssetsDirName);
            wrench.copyDirSyncRecursive(options.assets, outAssetsDirName, {preserve: true});
          }
          if (options.resources) {
            var outResourcesDirName = options.outputResources || path.join(options.output, path.basename(options.resources));

            console.log("Copying resources to " + outResourcesDirName + "...");

            wrench.mkdirSyncRecursive(outResourcesDirName);
            wrench.copyDirSyncRecursive(options.resources, outResourcesDirName, {preserve: true});
          }
          cb(null);
        },

        function(cb) {
          render(options, cbReturn, function(err) {
            cb(err);
          });
        },

        function(cb) {
          if (options.json) {
            var outputJson = cbReturn;

            outputJson.baseUrl = options.baseUrl;
            outputJson.title = options.title;

            fs.writeFile(path.join(options.output, slugify(options.title) + ".json"), JSON.stringify(outputJson, null, "    "), function(err) {
              cb(err);
            });
          }
          else
            cb(null);
        }
    ], function(err, results) {
      if (err) return callback(err);

      if (options.disableTests !== true) {
          funcDocs.runTests([destDir], _.extend({stopOnFail: false, ext: ".html", safeWords: options.safeWords}, options), function(err) {
                if (err) return callback(err);

              return callback(null, cbReturn);
          });
      }
      else
        return callback(null, cbReturn);
    });
}

function render(options, cbReturn, callback) {
  var defaultTemplateFile = path.join(options.skin);
  var defaultTemplate = fs.readFileSync(defaultTemplateFile, 'utf8');
  var defaultCompileFn = jade.compile(defaultTemplate, {filename: defaultTemplateFile, pretty: true});
  console.log("Building files...");

  async.forEach(files, function(filepath, cb) {
      fs.stat(filepath, function (err, stats) {
          if (err) return callback(err);
          var mtime = stats.mtime.valueOf();
          var filename = path.basename(filepath, options.extension);

          var jadeTemplateFile = path.join(options.skin, filename + '.jade');
          if (fs.existsSync(jadeTemplateFile)) {
            var jadeTemplate = fs.readFileSync(jadeTemplateFile, 'utf8');
            var jadeCompileFn = jade.compile(jadeTemplate, {filename: jadeTemplateFile, pretty: true});
          } else {
            var jadeCompileFn = defaultCompileFn;
          }

          fs.readFile(filepath, 'utf8', function(err, data) {
              if (err) return callback(err);

              Generator.render(options, jadeCompileFn, filepath, filename, data, mtime, function(err, html) {
                var fileObj = {};
                fileObj.filename = filename;
                fileObj.mtime = mtime;
                fileObj.pageTitle = data.split("\n")[0].substring(2);

                if (options.contentId) {
                  var $ = cheerio.load(html);
                  fileObj.contents = $("#" + options.contentId).html();
                }
                else {
                  fileObj.contents = html;
                }

                if (cbReturn.toc === undefined && options.tocId) {
                  var $ = cheerio.load(html);
                  cbReturn.toc = $("#" + options.tocId).html();
                }

                cbReturn.files.push(fileObj);
                cb(null);
              });
          });
      });
  }, function(err, results) {
      callback(err);
  });
};

function slugify(str) {
  str = str.toLowerCase();
  str = str.replace(/^\s+|\s+$/g, "");
  str = str.replace(/[\/_|\s]+/g, "-");
  str = str.replace(/[^a-z0-9-]+/g, "");
  str = str.replace(/[-]+/g, "-");
  return str = str.replace(/^-+|-+$/g, "");
}