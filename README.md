# Abricotine

> A markdown editor for desktop

![Screenshot](screenshot.jpg)

In **Abricotine**, you can preview your document directly in the text editor rather than in a side pane. 

![Another screenshot](screenshot2.jpg)

**Abricotine** is an [open-source software](LICENSE.txt) based on modern web technologies (HTML5, CSS3 & Node.js).

## Features

* Write in markdown (or GFM) and export your documents in HTML,
* Preview text elements (such as headers, images, math, embedded videos, todo lists...) while you type,
* Display document table of content in the side pane,
* Display syntax highlighting for supported languages (HTML, XML, CSS, Javascript, and more to come...),
* Show helpers, anchors and hidden characters,
* Copy formatted HTML in the clipboard,
* Write in a distraction-free fullscreen view,
* Manage and beautify markdown tables,
* Search and replace text,
* And more features to come...

Abricotine is still in beta development. If you find a bug please report it [in the dedicated bug tracker](https://github.com/brrd/Abricotine/issues). 

## Installation and usage

Abricotine is working on Windows (7 and later), Linux and OSX.

### Installation from binaries

Please note that prebuilt binaries are not provided for OSX, so Mac users will need to build the app by themselves (see ["Building and packaging"](#building-and-packaging)).

For Windows and Linux users, the following installation method is recommended:

1. Download prebuilt binaries from the [Releases page](https://github.com/brrd/Abricotine/releases),
2. Extract the archive,
3. Run `Abricotine.exe` (on Windows) or `Abricotine` (on Linux).

Installers are not released yet.

### Building and packaging

#### Requirements

* [Node.js](https://nodejs.org/en/) and `npm`,
* Make sure you meet [node-gyp](https://github.com/nodejs/node-gyp) requirements (specific to your platform and architecture),
* `git` (for Bower installation).

#### Building

1. Install requirements,
2. Download [the latest Abricotine release source](https://github.com/brrd/Abricotine/releases) and extract the archive,
3. Run `$ npm install` in the extracted folder.
4. You can use Abricotine by running `$npm start` from its directory. To open a specific file, run `$npm start -- [path-to-file]`.

#### Packaging

Run `$ npm run packager` from the built project directory and select your platform and architecture.

Packages are created in the `dist` directory.

## Configuration

You can open and edit Abricotine `JSON` configuration file by clicking "Edit preferences" in the "Edit" menu. 

Most of the configuration entries are already handled by menus so you do not need to edit a file for changing them. However there is no menu for editing the following options:

### `autopreview-security`

If set to `true`, only iframes loaded from domains listed in `autopreview-domains` will be previewed.

Default is `true`.

### `autopreview-domains`

Contains the list of domains considered as safe when previewing iframes (see `autopreview-security`).

Default:

```
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

## Adding spell checker dictionaries

Abricotine uses [hunspell](http://hunspell.sourceforge.net/) dictionaries for Linux and Windows 7. If you want to add dictionaries, simply drop the dictionary folder in the `dict` subdirectory of Abricotine configuration folder.

Otherwise Abricotine uses the OS builtIn dictionaries when supported.

## Contributing

Abricotine is an open source program. Feel free to fork and contribute.

In order to keep the match between this documentation and the last release, please contribute and pull requests on the dedicated `develop` branch.

## License

**Abricotine - Markdown Editor**  
**Copyright (c) 2015 Thomas Brouard**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
