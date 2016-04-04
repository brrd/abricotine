/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrApplication = require.main.require("./abr-application.js"),
    app = require("app"),
    creator = require("./creator.js");

// Check app is single instance
var abrApp = null,
    isSecondaryInstance = app.makeSingleInstance(function(argv, workingDir) {
        process.chdir(workingDir);
        abrApp.run(argv);
        return true;
    });
if (isSecondaryInstance) {
    app.quit();
    return;
}

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
            abrApp = new AbrApplication();
        });
});
