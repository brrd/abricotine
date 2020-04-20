var installer = require("electron-installer-debian"),
    pkg = require("../package.json"),
    prettyMs = require("pretty-ms");

var options = {
        src: "dist/" + pkg.productName + "-linux-" + process.arch + "/",
        dest: "dist/installers/",
        arch: process.arch === "ia32" ? "i386" : "amd64",
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

console.log("Creating debian package for linux " + process.arch);

installer(options)
    .then(() => console.log("Package successfully created at " + options.outputDirectory + " in " + prettyMs(new Date().getTime() - startTime)))
    .catch(err => {
        console.error(err, err.stack)
        process.exit(1)
    });
