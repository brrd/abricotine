var AbrApplication = require.main.require("./abr-application.js"),
    app = require("app"),
    constants = require.main.require("./constants.js"),
    fs = require("fs"),
    ipc = require("ipc"),
    utils = require.main.require("./utils.js");

// Create the app folder if it doesn't already exist
try {
    fs.mkdirSync(constants.appPath);
} catch(err) {
    if ( err.code != 'EEXIST' ) throw err;
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
