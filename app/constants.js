/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var app = require("app"),
    appPath = app.getAppPath(),
    pathModule = require("path"),
    pkg = require.main.require("../package.json"),
    userDataPath = pathModule.join(app.getPath("userData"), "/app"),
    tmpPath = pathModule.join(app.getPath("temp"), "/Abricotine");

module.exports = {
    appName: "Abricotine",
    appVersion: pkg.version,
    homepageURL: pkg.repository.url,
    path: {
        app: appPath,
        icon: pathModule.join(appPath, "/icons/abricotine.png"),
        bigIcon: pathModule.join(appPath, "/icons/abricotine@2x.png"),
        dictionaries: pathModule.join(userDataPath, "dict/"),
        dictionariesLocal: pathModule.join(appPath, "/app/dict"),
        tmp: tmpPath,
        tmpThemes: pathModule.join(tmpPath, "/themes"),
        userConfig: pathModule.join(userDataPath, "/config.json"),
        userData: userDataPath,
        window: pathModule.join(appPath, "/app/renderer/index.html")
    }
};
