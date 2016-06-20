/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

// NOTE: The theme loader compiles less CSS. Right now it is used once at startup but it could be extended later in the future to manage multiple themes.

var app = require("electron").app,
    constants = require.main.require("./constants.js"),
    files = require("./files.js"),
    less = require("less"),
    pathModule = require("path");

var appPath = app.getAppPath(),
    lessPath = pathModule.join(appPath, "/app/less"),
    themesPath = pathModule.join(lessPath, "/themes"),
    tmpThemesPath = constants.path.tmpThemes;

var themeLoader = {

    // Load theme and execute callback when done
    load: function (themeName, callback) {
        themeName = themeName || "abricotine";
        var inputPath = pathModule.join(themesPath, "/" + themeName + ".less"),
            outputPath = pathModule.join(tmpThemesPath, "/" + themeName+ ".css");
        files.readFile(inputPath, function (data) {
            var lessOptions = {
                paths: [lessPath]
            };
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
