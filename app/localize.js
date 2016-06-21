/*
 *   Abricotine - Markdown Editor
 *   Copyright (c) 2015 Thomas Brouard
 *   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
 */

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

module.exports.get = function (key, defaultTranslation, argsArray) {
    var translation = null;
    if (translations[key]) {
        translation = translations[key];
    } else if (defaultTranslation) {
        translation = defaultTranslation;
    }
    // insert message args
    if (translation && argsArray && argsArray.length) {
        for (var i = 0; i < argsArray.length; i++) {
            var regexp = new RegExp("%" + i, "g");
            translation = translation.replace(regexp, argsArray[i]);
        }
    }
    return translation;
};
