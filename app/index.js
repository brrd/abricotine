/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrApplication = require.main.require("./abr-application.js"),
    app = require("app"),
    create = require("./create.js");

// Quit app when all windows are closed
app.on("window-all-closed", function() {
    if (process.platform != "darwin") {
        app.quit();
    }
});

Promise.all([
    new Promise (function (resolve, reject) {
        app.on("ready", resolve);
    }),
    create
]).then(function () {
    var abrApp = new AbrApplication();
});
