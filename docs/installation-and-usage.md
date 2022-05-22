# Installation and usage

Abricotine is working on Windows (7 and later), Linux and OSX.

## Installation

### Windows

Download the windows installer from the [Releases page](https://github.com/brrd/Abricotine/releases) and run it.

Also, you can get Abricotine from [Scoop](https://scoop.sh):

```powershell
scoop install abricotine # in extras bucket
```

### OSX

Download OSX prebuilt binaries from the [Releases page](https://github.com/brrd/Abricotine/releases), extract the archive (if necessary) and run Abricotine.

OSX users can also use Homebrew Cask to install Abricotine: `$ brew install --cask abricotine`.

### Ubuntu, Debian and other Debian-based distributions

Download the provided .deb package from the [Releases page](https://github.com/brrd/Abricotine/releases) and install it.

### Other Linux distributions

Download linux prebuilt binaries from the [Releases page](https://github.com/brrd/Abricotine/releases), extract the archive and run Abricotine.

On Fedora you will also have to install the `libXScrnSaver` package: `yum install libXScrnSaver`

## Building and packaging

### Requirements

[Node.js](https://nodejs.org/en/) and `npm` are required.

### Building

1. Install requirements,
2. Download [the latest Abricotine release source](https://github.com/brrd/Abricotine/releases) and extract the archive,
3. Run `$ npm install` in the extracted folder.
4. You can use Abricotine by running `$npm start` from its directory. To open a specific file, run `$npm start -- [path-to-file]`.

### Packaging

Run `$ npm run dist` from the built project to package the app for your os. Packages are created in the `dist` directory.

Once packages are built you can use the following commands:

* `$ npm run winsetup`: create Windows installer.
* `$ npm run deb`: create a Debian package.
