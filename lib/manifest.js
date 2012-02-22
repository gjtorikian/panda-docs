var Manifest, ManifestFile, generateSlug;

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    util = require('util');

var helpers = require('./helpers');

var async = require('async'),
    findit = require('findit');

Manifest = module.exports;

generateSlug = function(str) {
  str = str.toLowerCase();
  str = str.replace(/^\s+|\s+$/g, "");
  str = str.replace(/[\/_|\s]+/g, "-");
  str = str.replace(/[^a-z0-9-]+/g, "");
  str = str.replace(/[-]+/g, "-");
  return str = str.replace(/^-+|-+$/g, "");
};

Manifest.open = function(manifestFile, callback) {
  Manifest.uri = manifestFile;
  var data = fs.readFileSync(manifestFile, 'utf8');//, function(err, data) {
   // if (err) return callback(err); 

    var files, options, _ref;
        
    // grab the manifest options
    options = JSON.parse(data);
    if (options.home) files.unshift(options.home);

    if (options.files === undefined) {
      console.error("You have no files defined! Panda can do nothing for you.");
      process.exit(0);
    }
    if (options.extension === undefined) {
      options.extension = ".md";
    }
    else {
      if (options.extension.charAt(0) != ".") { // e.g. "md", add the '.'
          options.extension = "." + options.extension;
      }
    }

    Manifest.options = options;

    async.map(Manifest.options.files, checkDir, function(err, results) {
      // unfortunate necessity; .on('directory') below returns an array, there's no way
      // that I can tell to actually replace an element with many more elements
      var subArray = [];
      for (var i = 0; i < results.length; i++) {
          if (Array.isArray(results[i])) {
            var dirArray = results[i];
            dirArray.forEach(function (f) {
              subArray.push(f);
            });
            results.splice(i, 1);
            i--;
          }
      }
        results = results.concat(subArray);
        Manifest.options.files = eliminateDuplicates(results);
        callback(err);
    });  
};

function checkDir(item, callback) {
  var manifestDir = path.dirname(Manifest.uri);
  var results = [], item = path.resolve(manifestDir, item);

      fs.stat(item, function(err, stats) {
        if (stats.isDirectory()) {
          var finder = findit.find(item);

          finder.on('file', function (file, stat) {
            if (path.extname(file) == Manifest.options.extension) {
              results.push(file);
            }
          });

          finder.on('directory', function (dir, stat) {
            //console.log("Digging into " + dir);
          }); 

          finder.on('end', function () {
            callback(err, results);
         });
        }
        else if (path.extname(item) == Manifest.options.extension) {
          callback(err, item);
        }
    });
}

function eliminateDuplicates(arr) {
  var i,
      len=arr.length,
      out=[],
      obj={};

  for (i=0;i<len;i++) {
    obj[arr[i]]=0;
  }
  for (i in obj) {
    if (i !== undefined && i !== '') {
        out.push(i);
    }
  }
  return out;
}