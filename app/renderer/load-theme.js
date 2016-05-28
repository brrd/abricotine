/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("remote"),
    app = remote.require("app"),
    constants = remote.require("./constants.js"),
    files = remote.require("./files.js"),
    less = require("less"),
    pathModule = require("path");

var appPath = app.getAppPath(),
    lessPath = pathModule.join(appPath, "/app/less"),
    themesPath = constants.path.themes,
    tmpThemesPath = constants.path.tmpThemes;

function loadTheme (themeName, force, callback) {
    function end () {
        // Update theme in head
        $("#theme").attr("href", outputPath);
        // Run callback
        if (typeof callback === "function") {
            callback(themeName, outputPath);
        }
    }
    themeName = themeName || constants.defaultTheme;
    var inputPath = pathModule.join(lessPath, "/main.less"),
        themePath = pathModule.join(themesPath, "/" + themeName),
        outputPath = pathModule.join(tmpThemesPath, "/" + themeName + ".css");
    // Theme is not reloaded if it already exists, except if force = true
    if (files.fileExists(outputPath) && !force) {
        return end();
    }
    files.readFile(inputPath, function (data) {
        var lessOptions = {
            paths: [lessPath, themePath]
        };
        less.render(data, lessOptions)
            .then(function(output) {
                files.createDir(outputPath);
                files.writeFile(output.css, outputPath, end);
            },
            function(error) {
                console.error(error);
            });
    });
}

module.exports = loadTheme;
