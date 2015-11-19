var app = require("app"),
    appPath = app.getAppPath(),
    pkg = require.main.require("../package.json"),
    userDataPath = app.getPath("userData") + "/app",
    tmpPath = app.getPath("temp") + "/Abricotine";

module.exports = {
    appName: "Abricotine",
    appVersion: pkg.version,
    path: {
        app: appPath,
        icon: appPath + "/abricotine.png",
        tmp: tmpPath,
        tmpThemes: tmpPath + "/themes",
        userConfig: userDataPath + "/config.json",
        userData: userDataPath,
        window: appPath + "/app/renderer/index.html"
    }
};
