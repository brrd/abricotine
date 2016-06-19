var constants = require("./constants.js"),
    files = require.main.require("./files.js"),
    paths = require("path"),
    fs = require('fs');

var translations = {};

module.exports.load = function (language) {
    var languageFile = paths.join(constants.path.languages, language + ".json");
    if (files.fileExists(languageFile)) {
        // TODO find approaching locale when exact language file does not exist (e.g. load "fr.json" when "fr_BE.json" is asked)
        // TODO handle parsing errors (e.g. file is not valid JSON)
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
