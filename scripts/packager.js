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
    questions = [
        {
            type: "checkbox",
            name: "platform",
            message: "Platform?",
            choices: ["linux", "win32"] // "darwin" & "all" not avalaible
        },
        {
            type: "checkbox",
            name: "arch",
            message: "Arch?",
            choices: ["ia32", "x64"]
        },
        {
            type: "confirm",
            name: "confirmation",
            message: "Packages will be built from '" + absPath(inputPath) + "' to '" + absPath(outputPath) + ". OK? ",
        },
    ];

inquirer.prompt(questions, function( answers ) {
    if (!answers.confirmation || !answers.platform || !answers.arch) {
        console.log("Operation aborted");
        return;
    }
    var platform = answers.platform,
        arch = answers.arch.length === 2 ? "all" : answers.arch[0],
        options = {
            dir: inputPath,
            name: pkg.name,
            platform: platform,
            arch: arch,
            version: "0.35.1", // Electron version
            "app-version": pkg.version,
            icon: icoPath,
            out: outputPath,
            overwrite: true,
            ignore: ["/node_modules/electron-prebuilt($|/)", "/node_modules/electron-packager($|/)", "/\.git($|/)", "/\.bin($|/)", "/node_modules/bower($|/)", "/node_modules/electron-rebuild($|/)", "/node_modules/inquirer($|/)", "^/dist($|/)"],
            prune: true,
            asar: true,
            "version-string": {
                ProductName: "Abricotine",
                InternalName: "Abricotine",
                LegalCopyright: "Copyright (c) 2015 Thomas Brouard"
            }
        },
        startTime = new Date().getTime();
    packager(options, function (err, appPath) {
        if (err) {
            console.error (err);
        } else {
            console.log("Packages were built in " + prettyMs(new Date().getTime() - startTime));
        }
    });
});
