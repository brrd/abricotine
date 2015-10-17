var app = require("app");

// TODO: pas utilisé partout. Que faire ? Il faudrait plutôt un json avec des expends

var appPath = app.getPath('userData') + '/app',
    constants = {
        appName: "Abricotine",
        appPath: appPath,
        appIconPath: "/abricotine.png",
        indexHtml: "/app/renderer/index.html",
        userConfigPath: appPath + "/config.json"
    };

module.exports = constants;
