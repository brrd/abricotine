#!/usr/bin/env node

var commander = require("commander"),
    pkg = require("../package.json"),
    prettyMs = require("pretty-ms");

commander
    .option("-p, --platform <platform>", "target platform: linux, win32, darwin, all")
    .option("-a, --arch <arch>", "target arch: ia32, x64, all")
    .parse(process.argv);

if ((commander.platform && commander.platform !== process.platform) || (commander.arch && commander.arch !== process.arch)) {
    console.log("WARNING! You are running the installer script from an environment that does not match the target platform and arch. This may not work.");
}

var platform = commander.platform || process.platform,
    arch = commander.arch || process.arch;

var options = {
        appDirectory: "dist/" + pkg.name + "-" + platform + "-" + arch + "/",
        outputDirectory: "dist/installers/",
        tags: pkg.keywords
    },
    startTime = new Date().getTime();

if (platform === "win32") {
    var electronInstaller = require('electron-winstaller');

    options.setupExe = pkg.name + "-setup-" + platform + "-" + arch + ".exe";
    options.iconUrl = "http://raw.githubusercontent.com/brrd/Abricotine/master/icons/abricotine.ico";
    options.setupIcon = "icons/abricotine.ico";
    options.noMsi = true;

    console.log("Creating installer for platform " + platform + " " + arch);
    electronInstaller.createWindowsInstaller(options)
        .then(function () {
            console.log("Successfully created installers at " + options.outputDirectory + " in " + prettyMs(new Date().getTime() - startTime));
        }, function (err) {
            console.error(err, err.stack);
        });
} else {
    console.error("Unrecognized platform");
}
