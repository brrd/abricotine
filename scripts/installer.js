#!/usr/bin/env node

var commander = require("commander"),
    pkg = require("../package.json"),
    prettyMs = require("pretty-ms");

commander
    .option("-p, --platform <platform>", "target platform: linux, win32, darwin")
    .option("-a, --arch <arch>", "target arch: ia32, x64")
    .parse(process.argv);

if ((commander.platform && commander.platform !== process.platform) || (commander.arch && commander.arch !== process.arch)) {
    console.log("WARNING! You are running the installer script from an environment that does not match the target platform and arch. This may not work.");
}

var platform = commander.platform || process.platform,
    arch = commander.arch || process.arch;

// TODO : create a separate script for each platform (ex: deb vs rpm)
if (platform === "win32") {
    var electronInstaller = require("electron-winstaller");

    var options = {
            appDirectory: "dist/" + pkg.name + "-" + platform + "-" + arch + "/",
            outputDirectory: "dist/installers/",
            tags: pkg.keywords,
            setupExe: pkg.name + "-setup-" + platform + "-" + arch + ".exe",
            iconUrl: "http://raw.githubusercontent.com/brrd/Abricotine/master/icons/abricotine.ico",
            setupIcon: "icons/abricotine.ico",
            loadingGif: "icons/abricotine-loading.gif",
            noMsi: true
        },
        startTime = new Date().getTime();

    console.log("Creating installer for platform " + platform + " " + arch);
    electronInstaller.createWindowsInstaller(options)
        .then(function () {
            console.log("Successfully created installers at " + options.outputDirectory + " in " + prettyMs(new Date().getTime() - startTime));
        }, function (err) {
            console.error(err, err.stack);
        });
} else if (platform === "linux") {
    var installer = require("electron-installer-debian");

    var options = {
        src: "dist/" + pkg.name + "-" + platform + "-" + arch + "/",
        dest: "dist/installers/",
        arch: arch === "ia32" ? "i386" : "amd64",
        section: "text",
        icon: {
            "48x48": "icons/abricotine-48.png",
            "64x64": "icons/abricotine-64.png",
            "128x128": "icons/abricotine.png",
            "256x256": "icons/abricotine@2x.png"
        },
        categories: ["Office"],
        mimeType: ["text/x-markdown", "text/markdown"]
    },
    startTime = new Date().getTime();

    console.log("Creating installer for platform " + platform + " " + arch);
    installer(options, function (err) {
        if (err) {
            console.error(err, err.stack);
            process.exit(1);
        }
        console.log("Successfully created installers at " + options.outputDirectory + " in " + prettyMs(new Date().getTime() - startTime));
    });
} else if (platform === "darwin") {
    console.log("No installer created on OSX");
} else {
    console.error("Unrecognized platform");
}
