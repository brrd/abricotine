# Installation and usage

Abricotine is working on Windows (7 and later), Linux and OSX.

## Installation from binaries

The following installation method is recommended:

1. Download prebuilt binaries for your os from the [Releases page](https://github.com/brrd/Abricotine/releases),
2. Extract the archive,
3. Run Abricotine.

OSX users can also use Homebrew Cask: `$ brew cask install abricotine`.

Windows installers and Linux packages are not released yet.

## Building and packaging

### Requirements

* [Node.js](https://nodejs.org/en/) and `npm`,
* Make sure you meet [node-gyp](https://github.com/nodejs/node-gyp) requirements (specific to your platform and architecture),

### Building

1. Install requirements,
2. Download [the latest Abricotine release source](https://github.com/brrd/Abricotine/releases) and extract the archive,
3. Run `$ npm install` in the extracted folder.
4. You can use Abricotine by running `$npm start` from its directory. To open a specific file, run `$npm start -- [path-to-file]`.

### Packaging

Run `$ npm run packager` from the built project to package the app for your os. Packages are created in the `dist` directory.

#### Packaging for another os

If you need to target another platform or arch, your can use `$ npm run packager -- -p <platform> -a <arch>`. See `$ npm run packager -- --help` for more information about allowed parameters.

Since Abricotine requires [native modules that need to be rebuild for each platform and arch](https://github.com/atom/electron/blob/master/docs/tutorial/using-native-node-modules.md), you should not try to target another operating system unless you provide a `node_module` directory which was built with `electron-rebuild` on an environment that matches the target.

## Debug mode

Use the `--debug` flag to open Abricotine with the following options activated:

* Chrome developer tools
* Debug menu visible
