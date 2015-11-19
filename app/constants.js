var app = require("app"),
    appPath = app.getAppPath(),
    userDataPath = app.getPath("userData") + "/app",
    tmpPath = app.getPath("temp") + "/Abricotine";

module.exports = {
    appName: "Abricotine",
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
