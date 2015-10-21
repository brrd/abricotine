// The theme loader compiles less CSS. Right now it is used once at startup but it could be extended later in the future to manage multiple themes.

var app = require("app"),
    files = require("./files.js"),
    less = require("less");

var appPath = app.getAppPath(),
    lessPath = appPath + "/app/less",
    themesPath = lessPath + "/themes",
    tmpThemesPath = app.getPath("temp") + "/Abricotine/themes";

var themeLoader = {

    // Load theme and execute callback when done
    load: function (themeName, callback) {
        themeName = themeName || "abricotine";
        var inputPath = themesPath + "/" + themeName + ".less",
            outputPath = tmpThemesPath + "/" + themeName+ ".css";
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
