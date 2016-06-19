var constants = require("./constants.js"),
    files = require.main.require("./files.js"),
    paths = require("path"),
    fs = require('fs');

var translations = {};

module.exports.load = function (language) {
    var languageFile = paths.join(constants.path.languages, language + ".json");
    if (files.fileExists(languageFile)) {
        var fileContent = fs.readFileSync(languageFile, 'utf8');
        translations = JSON.parse(fileContent);
    }
    else {
        console.warn("Missing translation for " + language);
    }
};

module.exports.get = function (key) {
    if (translations[key]) return translations[key];
    return null;
};
