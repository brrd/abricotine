# Themes

## Installing a theme

Themes must be stored in the user config directory into the `themes` subfolder.

## Creating a theme

A template consists of a directory which contains two files (`theme.json` and `theme.less`).

See [the default theme](https://github.com/brrd/Abricotine/tree/master/default/themes/default) as an example.

### `theme.json`

A `JSON` file that contains the theme metadatas.

* `name`: the theme name
* `label`: the label to use in the "Theme" menu

The following entries are optional:

* `author`
* `description`
* `license`

### `theme.less`

The file where you can customize your theme by using LESS variables and mixins. See [the default theme](https://github.com/brrd/Abricotine/tree/master/default/themes/default) to view customizable elements. You can also add your own rules at the end of the file.

It is recommanded to run Abricotine in [debug mode](https://github.com/brrd/Abricotine/blob/master/docs/installation-and-usage.md#debug-mode) when developing a new theme. Debug mode provides the ability to view styles with the devtools pane and to reload the current theme.
