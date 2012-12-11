# Panda Docs

What's black and white and read all over?

![Panda reading a newspaper](http://www.galaxyclock.com/panda_reading.jpg)

This is a documentation build system that takes Markdown files as sources, and produces HTML files. It runs on [Node.js](http://nodejs.org/), and uses [Jade](http://jade-lang.com/) as its templating engine.

## Features

 - Markdown syntax using [NAMP](https://github.com/gjtorikian/namp).
 - Support for [content references (conrefs) in Markdown](https://github.com/gjtorikian/markdown_conrefs)
 - Pass in individual files or entire directories; exclude files and directories with glob matching
 - Embeddable metadata
 - Easy template customization
 - Automatic linking for all heading tags (`h1`, `h2`, _e.t.c._), as well as automatic table of headers generation
 - Provides a JSON format

## Installation

Make sure you have a recent build of Node.js (this was tested on v0.6.0). Install it using npm:

    npm install panda-docs -g

Want to try a demonstration? Then clone this repository, and run

	node build.js

That'll turn this README into a better looking HTML file in the _/out_ directory.

## Usage

Use `panda-docs` in a script! Simply define a file similar to this one:

```javascript
var options = {
    title: "Panda (from script)"
}

panda.make(["./src/"], options, function(err, cbReturn) {
    if (err) {
        console.error(err);
    }
});
```

You can find out more information on options you can use below:

### Available Options

There are a number of arguments you can pass to Panda that affect the entire build. They are:

*  `-h`, --help`                      Show this help message and exit.
*  `-v`, `--version`                  Show program's version number and exit.
*  `-o PATH`, `--output PATH`         Resulting file(s) location [out]
*  `-oa PATH`, `--outputAssets PATH`  Resulting file(s) location for assets [out/assets]
*  `-t `STRING`, `--title STRING`     Title of the index page [Panda: Default Title Here]
*  `--skin PATH`                  The location of your primary Jade template [./templates/default/layout.jade]
*  `--assets PATH`                    The location of your asset files (CSS, Javascript, e.t.c.) [./templates/default/assets]
*  `-d`, `--disableTests`             Disables the test suite that runs at the end of an HTML build. This is NOT recommended.
*  `--keepFirstHeader`                If set, keeps the first header (`<h1>`) detected
*  `--baseUrl STRING `                Base url of all links [./]
*  `--keepOutDir`                     Does not wipe output directory before building (defaults to `false`)
*  `--safeWords`                      An array of words not to complain about when performing a spellcheck test

## Jade Templates

You have to specify at least one Jade file as a template for your pages. Within your Jade template, you have access to the following variables:

* `content` is the transformed HTML content of your Markdown file
* `metadata` is an object containing your document-based metadata values
* `manifest` is an object containing the Manifest.json properties
* `toh` is an object containing the headings for each file (`h1`, `h2`, _e.t.c._). See below for more information on this object.
* `headingTable` is a function you can use to generate a list of your page's table of contents. See below for more information on using this
* `fileName` is the name of the resulting file (without the extension)
* `title` is the title of the documentation
* `pageTitle` is the title of the current page
* `mtime` indicates the last modified time of your source file
* `markdown` references the Markdown converter; since this is based on namp, you'll want to add `.html` at the end to get the actual HTML

All your passed in `options` are also available.

#### Working with a Table of Contents for a Page

The `toh` object has the following structure:

```json
[{
    rank: 1,                   // the hierarchy in the toc (based on h1, h2, ..., h6)
    name: "My first header",   // the content of the header
    link: "#my-first-header",  // a direct internal url to be used
    line: 0                    // the line number in the original markdown file
    text: "# My first header"  // the actual Markdown header text
  }, {
    rank: 2,
    name: "Subtitle",
    link: "#subtitle",
    line: 4
  }, {
    rank: 4,
    name: "Minor Header",
    link: "#minor-header",
    line: 25
  },{
    rank: 2,
    name: "Another Subtitle!",
    link: "#another-subtitle",
    line: 58
}]
```

Each non-`h1` header is also automatically an anchor. The resulting HTML for an H2 called "Testing Your Highlighter" looks like this:

```html
<h2 id="testing-your-highlighter">
    <a class="heading_anchor" href="#testing-your-highlighter"></a>
    <i class="headerLinkIcon"></i>
    Testing Your Highlighter
</h2>
```

You can add an icon for `headerLinkIcon` to make it more discoverable, _i.e._ by using something from [Font Awesome](http://fortawesome.github.com/Font-Awesome/).

Finally, you also have access to a function, called `headingTable`, that automatically generates a table of contents for each page's heading. The resulting HTML produced by this function might look like this:

```html
<ol class="tocContainer level_1">
    <li class="tocItem level_2">
        <a href="#defining-a-mode">Defining a Mode</a>
    </li>
    <li class="tocItem level_2">
        <a href="#defining-syntax-highlighting-rules">Defining Syntax Highlighting Rules</a>
        <ol class="tocContainer level_2">
            <li class="tocItem level_3">
                <a href="#defining-tokens">Defining Tokens</a>
            </li>
            <li class="tocItem level_3">
                <a href="#defining-regular-expressions">Defining Regular Expressions</a>
                <ol class="tocContainer level_3">
                    <li class="tocItem level_4">
                        <a href="#groupings">Groupings</a>
                    </li>
                </ol>
            </li>
        </ol>
    </li>
    <li class="tocItem level_2">
        <a href="#defining-states">Defining States</a>
    </li>
    <li class="tocItem level_2">
        <a href="#code-folding">Code Folding</a>
    </li>
</ol>
```

Basically, every sub-heading is nested underneath a parent heading of larger size. In the example above, we have a page with an `<h2>` tag called "Defining a Mode", followed by another `<h2>`, "Defining Syntax Highlighting Rules", which itself is followed by two `<h3>` tags, "Defining Tokens" and "Defining Regular Expressions." The last `<h3>` has an `<h4>` called "Groupings." We then go back to some regular old `<h2>` tags.

This generated table always ignores the `<h1>` tag. You can customize it by by embedding the following signature into your Jade template:

```javascript
headingTable(toh, maxLevel, classes)
```

where

* `toh` is your page's `toh` object
* `maxLevel` is optional, and refers to the maximum heading number you want to display; this defaults to 4. Basically, any `h` tag greater than this number is ignored
* `classes` is optional, and it's an array of two strings. The first is a class that applies to all the `<ol>` tags; the second applies to the `<li>` tags. Every `<ol>` and `<li>` automatically gets a  `level_<POSITION>` class that is set to the current item's position


Thus, to generate the above, your Jade template might go:

```
!= headingTable(toh, 5, ['tocContainer', 'tocItem'])
```

## Callback Results

The callback for `panda` returns a JSON with one key: `files`, which is a listing of all the files generated. `files` is an array of objects, containing the following keys:

* `filename`: the filename (minus the suffix)
* `mtime`: the last modified time of your source file
* `pageTitle`: the title of the page (text only, meaning minus any `#` or `<h1>` indicators)

You could use this information to provide a list of Recently Updated content--which is exactly what the [Cloud9 IDE User Documentation](https://github.com/c9/cloud9ide-documentation) does.