/*
 *   Abricotine - Markdown Editor
 *   Copyright (c) 2015 Thomas Brouard
 *   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
 */

var app = require("electron").app,
    constants = require("./constants.js"),
    deepExtend = require("deep-extend"),
    paths = require("path"),
    fs = require('fs');

function getTranslations(lang) {
    var langFiles = [
            paths.join(constants.path.defaultDir, "lang", "en.json"),
            paths.join(constants.path.defaultDir, "lang", lang + ".json"),
            paths.join(constants.path.userData, "lang", lang + ".json")
        ],
        translations = [];
    langFiles.forEach(function(file) {
        try {
            var fileContent = fs.readFileSync(file, 'utf8');
            translations.push(JSON.parse(fileContent));
        } catch (err) {
            console.warn("Error while loading localization data: " + err);
        }
    });
    return deepExtend.apply(this, translations);
}

function Localizer(lang) {
    this.translations = {};
    lang = lang || app.getLocale();
    this.lang = lang;
    this.translations = getTranslations(lang);
}

Localizer.prototype = {

    getLang: function () {
        return this.lang;
    },

    get: function (key, defaultTranslation, argsArray) {
        var translation;
        if (this.translations[key]) {
            translation = this.translations[key];
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
    }
};

module.exports = Localizer;
