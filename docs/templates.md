# Templates

Since Abricotine 0.3.0, you can use alternative templates when exporting a document to HTML.

## Installing a template

Templates must be stored in the user config directory into the `templates` subfolder.

## Creating a template

A template consists of a directory which contains two files (`template.json` and `template.html`) and an optional `assets` directory.

See [the default template](https://github.com/brrd/Abricotine/tree/master/default/templates/default) as an example.

### `template.json`

A `JSON` file that contains the template metadatas.

* `name`: the template name
* `label`: the label to use in the "Export as HTML" menu. (the name should contain the word "template" in order to keep the menu explicit)

The following entries are optional:

* `accelerator`: an [accelerator](https://github.com/atom/electron/blob/master/docs/api/accelerator.md) for this template
* `author`: the template author
* `description`: the template description (if your template uses CSS or JS from another project then it could be a good idea to mention it here)
* `license`: the template license

### `template.html`

A HTML file were you can use the following placeholders:

* `$DOCUMENT_TITLE`: the document title
* `$DOCUMENT_CONTENT` : the document full text
* `$ASSETS_PATH`: the target assets path

> How to render math and syntax highlighting in my template?

Add the following code in the `<head>` section:

```html
<!-- highlight.js (from CDN) -->
<link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.2.0/styles/default.min.css">
<script src="http://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.2.0/highlight.min.js"></script>
<script>hljs.initHighlightingOnLoad();</script>
<!-- MathJax (from CDN) -->
<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML"></script>
```

### `assets` directory

Your template may contain an `assets` subdirectory to store the custom CSS and javascript files that you want to link to in `template.html`. You can specify the path of this directory with the `$ASSETS_PATH` placeholder:

```html
<link rel="stylesheet" type="text/css" href="$ASSETS_PATH/my_styles.css">
```
