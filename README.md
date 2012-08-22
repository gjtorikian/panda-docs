# Panda Docs

What's black and white and read all over?

![Panda reading a newspaper](http://www.galaxyclock.com/panda_reading.jpg)

This is a documentation build system that takes Markdown files as sources, and produces HTML files. It runs on [Node.js](http://nodejs.org/), and uses [Jade](http://jade-lang.com/) as its templating engine.

A lot of the concepts are based on [maximebf's "beautiful-docs"](https://github.com/maximebf/beautiful-docs), but there are so many differences--the most notable being that this is in Javascript, not Coffeescript--that I decided to turn it into a complete fork.


## Features

 - Markdown syntax using [NAMP](https://github.com/gjtorikian/namp). NAMP supports:
 	* [The standard Gruber syntax](http://daringfireball.net/projects/markdown/)
	* [The GitHub Flavored Markdown syntax](http://github.github.com/github-flavored-markdown/) (including language-specific codeblock fences)
	* Strikethroughs
	* Conversion of `Note: `, `Tip: `, and `Warning: ` blocks into [Twitter Bootstrap alert blocks](http://twitter.github.com/bootstrap/components.html#alerts)
	For more information, check out the NAMP documentation.
 - Support for [content references (conrefs) in Markdown](https://github.com/gjtorikian/markdown_conrefs)
 - Pass in individual files or entire directories
 - Embeddable metadata
 - Easy template customization (via Jade)
 - Automatic linking for all heading tags (`h1`, `h2`, _e.t.c._)

## Installation

Make sure you have a recent build of Node.js (this was tested on v0.6.0). Install it using npm:

    npm install panda-docs -g

Want to try a demonstration? Then clone this repository, and run

	node bin/panda-docs src/manifest.json 

That'll turn this README into a better looking HTML file in the _/out_ directory.

## Usage

    panda-docs </path/to/manifest.json> _[options]_ 

The _manifest.json_ file is mandatory, and all other options are optional. The default output directory here is _./out_.

If you'd like to use `panda-docs` in a script, you can! Simply define one like this:

```javascript
var panda = require("panda-docs");

panda.make(["./src/manifest.json", "-t", "Panda (from command line)"], function(err, cbReturn) {
    if (err) console.error(err);
});
```

You can find out more information on options you can use below:

### Manifest Files

A manifest file is a mandatory JSON file that indicates where your source files reside, as well as specifing customization options for your documentation pages.
 
A manifest file can have the properties listed below. All the properties are optional, with the exception of `files`.

 - `files`: An array defining the path to your files
 - `resources`: An array of directories to also copy into the _/out_ directory. This is usually used for accompanying or inline images.
 - `extension`: The extension of your Markdown files. Some people use `.md`, others `.markdown`, and still others `.text`. This is optional, and defaults to `.md`.
 - `home`: The file to display as the manual homepage (this won't show up in the TOC)
 - `codeHighlightTheme`: The name of [the highlightjs theme to use](http://softwaremaniacs.org/soft/highlight/en/) for code highlighting (defaults to 'github')

As noted above, files can either be absolute URIs, or relative to the manifest file. For example: 

    {
        "files": ["README.md", "../../someFile.md"]
    }

Note that every file must have ONE `h1` tag. This is used to generate the page's title information.

### Options

There are a number of arguments you can pass to Panda that affect the entire build. They are:

 - `-h, --help`: Display the help information
 - `-o`, `--output`: Resulting file(s) location [out]
 - `--outputAssets`: Resulting file(s) location for assets [out/assets]
 - `-t, --title`: Title of the documentation [Panda: Default Title Here]
 - `--template`: The location of your Jade templates [_./templates/default/layout.jade_]. Though the path is optional, you must have a valid Jade template _somewhere_.
 - `--assets`: The location of your assets (CSS, Javascript)
 - `--keepFirstHeader` : If set, keeps the first header (`<h1>`) detected
 - `--baseurl`: Base URL of all links
- `-r, --no-release`: If set, indicates that you're doing a development build. You can trigger different behavior in your Jade templates this way


## Jade Templates

You have to specify at least one Jade file as a template for your pages. Within your Jade template, you have access to the following variables:

* `content` is the transformed HTML content of your Markdown file
* `metadata` is an object containing your document-based metadata values
* `manifest` is an object containing the Manifest.json properties
* `toh` is an object containing the headings for each file (`h1`, `h2`, _e.t.c._). See below for more information on this object.
* `headingTable` is a function you can use to generate a list of your page's table of contents. See below for more information on using this
* `options` is an object containing your passed in properties
* `fileName` is the name of the resulting file (without the extension)
* `title` is the title of the documentation
* `pageTitle` is the title of the current page
* `mtime` indicates the last modified time of your source file

## Callback Results

The callback for `panda` returns a JSON with one key: `files`, which is a listing of all the files generated. `files` is an array of objects, containing the following keys:

* `filename`: the filename (minus the suffix)
* `mtime`: the last modified time of your source file
* `pageTitle`: the title of the page (text only, meaning minus any `#` or `<h1>` indicators)

You could use this information to provide a list of Recently Updated content--which is exactly what the [Cloud9 IDE User Documentation](https://github.com/c9/cloud9ide-documentation) does.

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

```jade
!= headingTable(toh, 5, ['tocContainer', 'tocItem'])
```