/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrApplication = require.main.require("./abr-application.js"),
    app = require("app"),
    defaultUserConfig = require.main.require("./config-user-default.json"),
    constants = require.main.require("./constants.js"),
    files = require.main.require("./files.js");

// Create the app folder if it doesn't already exist
files.createDir(constants.path.userData);
// Create the temp folder
files.createDir(constants.path.tmp);
// Create a config file if not found
if (!files.fileExists(constants.path.userConfig)) {
    files.writeFile(JSON.stringify(defaultUserConfig), constants.path.userConfig);
}

// When the shell is ready
app.on("ready", function() {
    var abrApp = new AbrApplication();
});

// Quit app when all windows are closed
app.on("window-all-closed", function() {
    if (process.platform != "darwin") {
        app.quit();
    }
});
