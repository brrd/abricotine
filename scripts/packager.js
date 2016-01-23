#!/usr/bin/env node

var inquirer = require("inquirer"),
    packager = require("electron-packager"),
    parsePath = require("parse-filepath"),
    pkg = require("../package.json"),
    prettyMs = require("pretty-ms");

function absPath (path) {
    if (typeof path !== "string") {
        return path;
    }
    return parsePath(path).absolute || path;
}

var inputPath = ".",
    outputPath = "./dist",
    icoPath = "./icons/abricotine",
    debug = process.argv.indexOf("--debug") !== -1,
    questions = [
        {
            type: "checkbox",
            name: "arch",
            message: "Arch?",
            choices: ["ia32", "x64"]
        },
        {
            type: "confirm",
            name: "confirmation",
            message: "Packages will be built for " + process.platform + " platform from '" + absPath(inputPath) + "' to '" + absPath(outputPath) + "'. OK? ",
        },
    ];

if (debug === true) console.log("--debug: node_modules will be ignored");

inquirer.prompt(questions, function( answers ) {
    if (!answers.confirmation || answers.arch.length === 0) {
        return console.log("Bad parameters. Operation aborted");
    }
    // Set options
    var arch = answers.arch.length === 2 ? "all" : answers.arch[0],
        options = {
            dir: inputPath,
            name: pkg.name,
            platform: process.platform,
            arch: arch,
            version: "0.35.1", // Electron version // TODO: match electron version in package.json
            "app-version": pkg.version,
            icon: icoPath,
            out: outputPath,
            overwrite: true,
            ignore: ["/node_modules/electron-prebuilt($|/)", "/node_modules/electron-packager($|/)", "/\.git($|/)", "/\.bin($|/)", "/node_modules/bower($|/)", "/node_modules/electron-rebuild($|/)", "/node_modules/inquirer($|/)", "^/dist($|/)"],
            prune: true,
            asar: true,
            "asar-unpack": "*.node",
            "version-string": {
                ProductName: "Abricotine",
                InternalName: "Abricotine",
                LegalCopyright: "Copyright (c) 2015 Thomas Brouard"
            }
        },
        startTime = new Date().getTime();
    // Dont pack all stuffs when debugging
    if (debug === true) {
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
});
