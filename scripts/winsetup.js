#!/usr/bin/env node

var installer = require("electron-winstaller"),
    pkg = require("../package.json"),
    prettyMs = require("pretty-ms");

var options = {
            appDirectory: "dist/" + pkg.name + "-win32-" + process.arch + "/",
            outputDirectory: "dist/installers/",
            tags: pkg.keywords,
            setupExe: pkg.name + "-setup-win32-" + process.arch + ".exe",
            iconUrl: "http://raw.githubusercontent.com/brrd/Abricotine/master/icons/abricotine.ico",
            setupIcon: "icons/abricotine.ico",
            loadingGif: "icons/abricotine-loading.gif",
            noMsi: true
        },
        startTime = new Date().getTime();

console.log("Creating installer for windows " + process.arch);

installer.createWindowsInstaller(options)
    .then(function () {
        console.log("Installer successfully created at " + options.outputDirectory + " in " + prettyMs(new Date().getTime() - startTime));
    }, function (err) {
        console.error(err, err.stack);
    });
