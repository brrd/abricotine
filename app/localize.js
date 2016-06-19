var constants = require("./constants.js"),
    files = require.main.require("./files.js"),
    paths = require("path"),
    fs = require('fs');

var translations = {};

module.exports.load = function (language) {
    var languageFile = paths.join(constants.path.languages, language + ".json"),
        fileContent;
    if (files.fileExists(languageFile)) {
        // TODO find approaching locale when exact language file does not exist (e.g. load "fr.json" when "fr_BE.json" is asked)
        try {
            fileContent = fs.readFileSync(languageFile, 'utf8');
            translations = JSON.parse(fileContent);
        } catch (err) {
            console.warn("Error while loading localization data (from file '" + languageFile + "'): " + err);
        }
    } else {
        console.warn("Error while loading localization data (from file '" + languageFile + "'): file does not exist");
    }
};

module.exports.get = function (key) {
    if (translations[key]) return translations[key];
    return null;
};
