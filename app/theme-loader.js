/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var app = require("app"),
    constants = require.main.require("./constants.js"),
    files = require("./files.js"),
    less = require("less"),
    pathModule = require("path");

var appPath = app.getAppPath(),
    lessPath = pathModule.join(appPath, "/app/less"),
    themesPath = constants.path.themes,
    tmpThemesPath = constants.path.tmpThemes;

var themeLoader = {
    // Load theme and execute callback when done
    load: function (themeName, callback) {
        var inputPath = pathModule.join(lessPath, "/main.less"),
            outputPath = pathModule.join(tmpThemesPath, "/" + (themeName || "default") + ".css");
        files.readFile(inputPath, function (data) {
            var lessOptions = {
                paths: [lessPath]
            };
            if (themeName) {
                var themePath = pathModule.join(themesPath, "/" + themeName);
                lessOptions.paths.push(themePath);
            }
            less.render(data, lessOptions)
                .then(function(output) {
                    files.createDir(outputPath);
                    files.writeFile(output.css, outputPath, function() {
                        if (typeof callback === "function") {
                            callback(themeName);
                        }
                    });
                },
                function(error) {
                    console.error(error);
                });
        });
    }
};

module.exports = themeLoader;
