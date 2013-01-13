var fs = require('fs'),
    path = require('path');

var FsTools         = require('fs-tools');
var minimatch       = require('minimatch');
var _               = require("underscore");

var argparse        = require('argparse');
var ArgumentParser  = argparse.ArgumentParser;

var cli = module.exports = new ArgumentParser({
  version:  require('./version'),
  addHelp:  true,
  formatterClass: function(options) {
    options['maxHelpPosition'] = 40;
    return new argparse.HelpFormatter(options);
  }
});

cli.addArgument(['paths'], {
  help:         'Source files location',
  metavar:      'PATH',
  action:       'append',
  nargs:        '+'
});


cli.addArgument(['--excludes'], {
  help:         'Glob patterns of filenames to exclude ' +
                '(you can use wildcards: ?, *, **).',
  dest:         'excludes',
  metavar:      'PATTERN',
  action:       'append',
  defaultValue: []
});

cli.addArgument(['--extension'], {
  help:         'The extension of your Markdown files. [.md]',
  dest:         'extension',
  metavar:      'STRING',
  defaultValue: '.md'
});

cli.addArgument(['-o', '--output'], {
  help:         'Resulting file(s) location [out]',
  dest:         'output',
  metavar:      'PATH',
  defaultValue: 'out'
});

cli.addArgument(['-oa', '--outputAssets'], {
  help:         'Resulting file(s) location for assets [out/assets]',
  dest:         'outputAssets',
  metavar:      'PATH',
  defaultValue: 'out/assets'
});

cli.addArgument(['--keepOutDir'], {
  help:         'Does not wipe output directory before building',
  dest:         'keepOutDir',
  action:       'storeTrue',
  defaultValue: false
});

cli.addArgument(['-t', '--title'], {
  help:         'Title of the index page [Panda: Default Title Here]',
  dest:         'title',
  metavar:      'STRING',
  defaultValue: 'Panda: Default Title Here'
});

cli.addArgument(['--skin'], {
  help:         'The location of your Jade templates [./templates/default]',
  dest:         'skin',
  metavar:      'PATH',
  defaultValue: './templates/default'
});

cli.addArgument(['--assets'], {
  help:         'The location of your asset files (CSS, Javascript, e.t.c.) [./templates/default/assets]',
  dest:         'assets',
  metavar:      'PATH'
});

cli.addArgument(['-e', '--resources'], {
  help:         'A resources directory to also copy into the _/out_ directory. This is usually used for accompanying or inline images.',
  dest:         'resources',
  metavar:      'PATH'
});

cli.addArgument(['-d', '--disableTests'], {
  help:         'Disables the test suite that runs at the end of an HTML build. This is NOT recommended.',
  dest:         'disableTests',
  action:       'storeTrue',
  defaultValue: false
});

cli.addArgument(['-nr', '--noRelease'], {
  help:         'If set, indicates that you\'re not doing a release',
  dest:         'noRelease',
  action:       'storeTrue',
  defaultValue: false
});

cli.addArgument(['--keepFirstHeader'], {
  help:         'If set, keeps the first header (<h1>) detected',
  dest:         'keepFirstHeader',
  action:       'storeTrue',
  defaultValue: false
});

cli.addArgument(['--codeHighlightTheme'], {
  help:         ' The name of the highlightjs theme to use for code highlighting',
  dest:         'codeHighlightTheme',
  action:       'storeTrue',
  metavar:      'STRING',
  defaultValue: 'github'
});

cli.addArgument(['--baseUrl'], {
  help:         'Base url of all links [./]',
  dest:         'baseUrl',
  metavar:      'STRING',
  defaultValue: './'
});

cli.addArgument(['--json'], {
  help:         'Provide a JSON file alongside the HTML output',
  dest:         'json',
  action:       'storeTrue',
  defaultValue: false
});

cli.addArgument(['--tocId'], {
  help:         'The DOM ID of your TOC section (to aid in JSON creation); optional',
  dest:         'tocId',
  metavar:      'STRING'
});

cli.addArgument(['--contentId'], {
  help:         'The DOM ID of your main content (to aid in JSON creation); optional',
  dest:         'contentId',
  metavar:      'STRING'
});

cli.findFiles = function findFiles(paths, excludes, extension, callback) {
  var entries = [];

  excludes = ["node_modules"].concat([]);

  // prepare matchers matchers
  if (excludes.length > 0) {
    excludes = _.map(excludes || [], function (p) {
      return isFunction(p) ? {test: p} : minimatch.makeRe(p);
    });
  }

  // make a copy consisting valueble paths only
  paths = paths.filter(function (p) { return !!p; });

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  function process(filename, lstats) {
    var include = true;

    if (0 < excludes.length) {
      include = !_.any(excludes, function (filter) {
        return /node_modules/.test(filename) || filter.test(filename, lstats);
      });
    }

    if (include && path.extname(filename) == extension) {
      entries.push(filename);
    }
  }

  function walk(err) {
    var pathname, lstats;

    // get next path
    pathname = paths.shift();

    // skip empty path or report real error
    if (err || !pathname) {
      callback(err, entries.sort());
      return;
    }

    // get lstats of the pathname
    lstats = fs.lstatSync(pathname);

    if (!lstats.isDirectory()) {
      // process non-directories directly
      process(pathname, lstats);
      walk();
      return;
    }

    FsTools.walk(pathname, function (filename, lstats, next) {
      process(filename, lstats);
      next();
    }, walk);
  }

  walk();
};