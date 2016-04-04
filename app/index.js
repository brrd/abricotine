/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrApplication = require.main.require("./abr-application.js"),
    app = require("app"),
    creator = require("./creator.js");

var abrApp = null,
    osxOpenFilePath = null;

// Check app is single instance
var isSecondaryInstance = app.makeSingleInstance(function(argv, workingDir) {
        process.chdir(workingDir);
        if (abrApp == null) {
            console.error("Error when trying to reach primary Abricotine instance");
            app.quit();
            return false;
        }
        abrApp.run(argv);
        return true;
    });
if (isSecondaryInstance) {
    app.quit();
    return;
}

// OSX open-file
app.on("open-file", function(event, path) {
    event.preventDefault();
    osxOpenFilePath = path;
});

// Quit app when all windows are closed
app.on("window-all-closed", function() {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", function () {
    // Reset config when --reset argument is used, otherwise ensure the config files exist
    var creatorFunc = process.argv.indexOf("--reset") !== -1 ? creator.reset : creator.create;
    creatorFunc()
        .then(creator.check)
        .then(function () {
            abrApp = new AbrApplication(osxOpenFilePath);
        });
});
