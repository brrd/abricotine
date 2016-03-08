# Installation and usage

Abricotine is working on Windows (7 and later), Linux and OSX.

## Installation from binaries

Please note that prebuilt binaries are not provided for OSX, so Mac users will need to build the app by themselves (see ["Building and packaging"](#building-and-packaging)).

For Windows and Linux users, the following installation method is recommended:

1. Download prebuilt binaries from the [Releases page](https://github.com/brrd/Abricotine/releases),
2. Extract the archive,
3. Run `Abricotine.exe` (on Windows) or `Abricotine` (on Linux).

Installers are not released yet.

## Building and packaging

### Requirements

* [Node.js](https://nodejs.org/en/) and `npm`,
* Make sure you meet [node-gyp](https://github.com/nodejs/node-gyp) requirements (specific to your platform and architecture),
* `git` (for Bower installation).

### Building

1. Install requirements,
2. Download [the latest Abricotine release source](https://github.com/brrd/Abricotine/releases) and extract the archive,
3. Run `$ npm install` in the extracted folder.
4. You can use Abricotine by running `$npm start` from its directory. To open a specific file, run `$npm start -- [path-to-file]`.

### Packaging

Run `$ npm run packager` from the built project directory and select your platform and architecture.

Packages are created in the `dist` directory.