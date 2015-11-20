/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var app = require("app"),
    appPath = app.getAppPath(),
    pkg = require.main.require("../package.json"),
    userDataPath = app.getPath("userData") + "/app",
    tmpPath = app.getPath("temp") + "/Abricotine";

module.exports = {
    appName: "Abricotine",
    appVersion: pkg.version,
    homepageURL: pkg.repository.url,
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
