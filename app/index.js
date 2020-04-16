/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

// Squirrel
if (require("electron-squirrel-startup")) return;

var app = require("electron").app,
    creator = require.main.require("./creator.js"),
    dialog = require("electron").dialog;

var abrApp = null,
    osxOpenFilePaths = [];

// Check app is single instance
app.requestSingleInstanceLock() || app.quit();
app.on("second-instance", (event, argv, cwd) => {
    process.chdir(cwd);
    if (abrApp == null) {
        console.error("Error when trying to reach primary Abricotine instance");
        app.quit();
        return false;
    }
    abrApp.run(argv);
    return true;
});

// OSX open-file
app.on("open-file", function(event, path) {
    event.preventDefault();
    if (abrApp) {
        abrApp.open(path);
    } else {
        osxOpenFilePaths.push(path);
    }
});

// Quit app when all windows are closed
app.on("window-all-closed", function() {
    if (process.platform != "darwin") {
        app.releaseSingleInstanceLock();
        app.quit();
    } else {
        abrApp.showMenu();
    }
});

app.on("will-quit", function() {
    abrApp.emptyTmpHTML();
});

app.on("ready", function () {
    // Install confirmation
    if (process.argv.indexOf("--squirrel-firstrun") !== -1) {
        var userChoice = dialog.showMessageBox({
            title: "Abricotine setup",
            message: "Abricotine has been successfully installed.",
            type: "info",
            buttons: ["Exit", "Run Abricotine"],
            defaultId: 1
        });
        if (userChoice === 0) {
            app.exit(0);
        }
    }

    // Load AbrApplication once app is ready
    var AbrApplication = require.main.require("./abr-application.js");

    // Reset config when --reset argument is used, otherwise ensure the config files exist
    var creatorFunc = process.argv.indexOf("--reset") !== -1 ? creator.reset : creator.create;
    creatorFunc()
        .then(creator.check)
        .then(function () {
            abrApp = new AbrApplication(osxOpenFilePaths);
        });
});
