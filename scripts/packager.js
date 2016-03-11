#!/usr/bin/env node

var commander = require("commander"),
    packager = require("electron-packager"),
    pkg = require("../package.json"),
    prettyMs = require("pretty-ms");

var inputPath = ".",
    outputPath = "./dist",
    icoPath = "./icons/abricotine";

commander
    .option("-d, --debug", "debug mode: ignore node_modules")
    .option("-p, --platform <platform>", "target platform: linux, win32, darwin, all")
    .option("-a, --arch <arch>", "target arch: ia32, x64, all")
    .parse(process.argv);

if (commander.debug === true) console.log("--debug: node_modules will be ignored");

if ((commander.platform && commander.platform !== process.platform) || (commander.arch && commander.arch !== process.arch)) {
    console.log("WARNING! You are running the packager script from an environment that does not match the target platform and arch. Please make sure that the provided node_module directory was built with electron-rebuild on an environment that matches the target.");
}

// Set options
var options = {
        dir: inputPath,
        name: pkg.name,
        platform: commander.platform || process.platform,
        arch: commander.arch || process.arch,
        version: "0.35.1", // Electron version // TODO: match electron version in package.json
        "app-version": pkg.version,
        icon: icoPath,
        out: outputPath,
        overwrite: true,
        ignore: ["/node_modules/electron-prebuilt($|/)", "/node_modules/electron-packager($|/)", "/\.git($|/)", "/\.bin($|/)", "/node_modules/bower($|/)", "/node_modules/electron-rebuild($|/)", "/node_modules/commander($|/)", "^/dist($|/)"],
        prune: true,
        asar: true,
        "asar-unpack": "*.node",
        "asar-unpack-dir": "default",
        "version-string": {
            ProductName: "Abricotine",
            InternalName: "Abricotine",
            LegalCopyright: "Copyright (c) 2015 Thomas Brouard"
        }
    },
    startTime = new Date().getTime();

// Dont pack all stuffs when debugging
if (commander.debug === true) {
    options.ignore.push("/node_modules($|/)", "/bower_components($|/)");
    options.prune = false;
}

// Run packager
packager(options, function (err, appPath) {
    if (err) {
        console.error (err);
    } else {
        console.log("Packages were built in " + prettyMs(new Date().getTime() - startTime));
    }
});
