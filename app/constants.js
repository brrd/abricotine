var app = require("app");

// TODO: pas utilisé partout. Que faire ?

var constants = {
    appName: "Abricotine",
    appPath: app.getPath('userData') + '/app/',
    appIconPath: "/abricotine.png",
    indexHtml: "/app/renderer/index.html",
    userConfigPath: this.appPath + "/user.json"
};

module.exports = constants;
