/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var constants = require.main.require("./constants.js"),
    files = require.main.require("./files.js"),
    pathModule = require("path");

var creator = {};

// Create configuration folders and copy default config files
creator.create = function () {
    return new Promise (function (resolve, reject) {
        // 1. Create folders
        // Create the app folder if it doesn't already exist (sync)
        files.createDir(constants.path.userData);
        // Create the temp folder (sync)
        files.createDir(constants.path.tmp);
        resolve();
    }).then(function () {
        // 2. Copy contents if not found
        return Promise.all([
            new Promise (function (resolve, reject) {
                // Create a config file
                if (!files.fileExists(constants.path.userConfig)) {
                    files.copyFile(pathModule.join(constants.path.defaultDir, "/config.json"), constants.path.userConfig, resolve);
                } else {
                    resolve();
                }
            }),
            new Promise (function (resolve, reject) {
                // Copy default dicts
                if (!files.dirExists(constants.path.dictionaries)) {
                    files.copyLocalDir(pathModule.join(constants.path.defaultDir, "/dict"), constants.path.dictionaries, resolve);
                } else {
                    resolve();
                }
            }),
            new Promise (function (resolve, reject) {
                // Copy default template
                if (!files.dirExists(constants.path.templatesDir)) {
                    files.copyLocalDir(pathModule.join(constants.path.defaultDir, "/templates"), constants.path.templatesDir, resolve);
                } else {
                    resolve();
                }
            })
        ]);
    });
};

// Erase the whole configuration
creator.erase = function () {
    return new Promise (function (resolve, reject) {
        files.deleteDir(constants.path.userData, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Reset: erase then create a new clear config
creator.reset = function () {
    return creator.erase().then(creator.create);
};

module.exports = creator;
