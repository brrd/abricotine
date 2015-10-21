var AbrApplication = require.main.require("./abr-application.js"),
    app = require("app"),
    constants = require.main.require("./constants.js"),
    files = require.main.require("./files.js"),
    ipc = require("ipc"),
    utils = require.main.require("./utils.js");

// Create the app folder if it doesn't already exist
files.createDir(constants.appPath);
// Create the temp folder
files.createDir(app.getPath("temp") + "/Abricotine/");

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
