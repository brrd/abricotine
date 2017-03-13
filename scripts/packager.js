#!/usr/bin/env node

var commander = require("commander"),
    ncp = require("ncp").ncp,
    packager = require("electron-packager"),
    path = require("path"),
    pkg = require("../package.json"),
    prettyMs = require("pretty-ms"),
    semver = require("semver");

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
        electronVersion: semver.clean(pkg.dependencies.electron),
        appVersion: pkg.version,
        icon: icoPath,
        out: outputPath,
        overwrite: true,
        ignore: ["/node_modules/electron-prebuilt($|/)", "/node_modules/electron($|/)", "/node_modules/electron-packager($|/)", "/\.git($|/)", "/\.bin($|/)", "/node_modules/bower($|/)", "/node_modules/electron-rebuild($|/)", "/node_modules/commander($|/)", "^/dist($|/)"],
        prune: true,
        asar: {
            unpackDir: "default"
        },
        win32metadata: {
            "CompanyName": pkg.name,
            "FileDescription": pkg.description,
            "ProductName": pkg.name,
            "InternalName": pkg.name
        }
    },
    startTime = new Date().getTime();

// Dont pack all stuffs when debugging
if (commander.debug === true) {
    options.ignore.push("/node_modules($|/)", "/bower_components($|/)");
    options.prune = false;
}

// Copy icons to each package
function copyIconsAll (appPaths, callback) {
    // Copy icons to a specific destination
    function copyIcons (destination) {
        return new Promise (function(resolve, reject) {
            ncp.limit = 16;
            ncp("./icons", destination, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });
    }
    // Get promises
    var proms = [];
    appPaths.forEach(function(appPath) {
        var destDir = path.join(appPath, "icons");
        proms.push(copyIcons(destDir));
    });
    // Copy
    Promise.all(proms)
        .then(function() {
            if (typeof callback === "function") callback();
        })
        .catch(function(err) {
            console.error(err);
        });
}

// Run packager
packager(options, function (err, appPaths) {
    if (err) {
        console.error (err);
    } else {
        copyIconsAll(appPaths, function () {
            console.log("Packages were built in " + prettyMs(new Date().getTime() - startTime));
        });
    }
});
