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

### `lang`

Sets the user interface language. By default, this value is `null`, which means that Abricotine will try to match your OS language and fall back to English if it is not available among [supported languages](https://github.com/brrd/Abricotine/tree/master/default/lang).

You can add your own translations in the `lang` subdirectory of Abricotine configuration folder. Feel free to commit your translations, contributions are welcome!

### `preview-template`

The name of the template to use when previewing document in the browser.

## Spell checker dictionaries

Abricotine uses [hunspell](http://hunspell.sourceforge.net/) dictionaries for Linux and Windows 7. If you want to add dictionaries, simply drop the dictionary folder in the `dict` subdirectory of Abricotine configuration folder.

Otherwise Abricotine uses the OS built in dictionaries when supported (you may need to check that dictionaries are installed in your system configuration).

## Reset configuration

**WARNING: deleted configuration is lost for ever!**

If you want to erase your configuration (including user-defined dictionaries and templates), run Abricotine in your terminal with the `--reset` flag.

This can be useful when a breaking changes happen in a new release (this can happen until Abricotine first stable release). However in such cases Abricotine will prompt you on startup.
