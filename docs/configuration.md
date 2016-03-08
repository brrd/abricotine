# Configuration

## User configuration file

You can open and edit Abricotine configuration file by clicking "Edit preferences" in the "Edit" menu. This will open Abricotine `config.json` file in your text editor.

Most of the configuration entries are already handled by menus so you do not need to edit a file for changing them. However there is no menu for editing the following options:

### `autopreview-security`

If set to `true`, only iframes loaded from domains listed in `autopreview-domains` will be previewed.

Default is `true`.

### `autopreview-domains`

Contains the list of domains considered as safe when previewing iframes (see `autopreview-security`).

Default:

```json
 "autopreview-domains": [
     "dailymotion.com",
     "deezer.com",
     "dribbble.com",
     "facebook.com",
     "github.com",
     "google.com",
     "instagram.com",
     "pinterest.com",
     "soundcloud.com",
     "spotify.com",
     "twitter.com",
     "vimeo.com",
     "youtube.com"
]
```

### `highlight-modes`

The list of the programming languages to highlight. The expected value is a comma-separated list of CodeMirror modes ([see the full list of supported modes](https://github.com/codemirror/CodeMirror/tree/master/mode)).

Example:

```json
	"highlight-modes": "coffeescript, ruby, php, python, brainfuck"
```

HTML, CSS, Javascript, XML and [C-like](http://codemirror.net/mode/clike/index.html) languages are supported regardless of this option.

### `preview-template`

The name of the template to use when previewing document in the browser.

## Spell checker dictionaries

Abricotine uses [hunspell](http://hunspell.sourceforge.net/) dictionaries for Linux and Windows 7. If you want to add dictionaries, simply drop the dictionary folder in the `dict` subdirectory of Abricotine configuration folder.

Otherwise Abricotine uses the OS builtIn dictionaries when supported.