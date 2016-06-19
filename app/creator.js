/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var constants = require.main.require("./constants.js"),
    dialog = require("dialog"),
    files = require.main.require("./files.js"),
    pathModule = require("path"),
    pkg = require("../package.json");

var creator = {};

// Create configuration folders and copy default config files
creator.create = function () {
    // 1. Create folders (sync)
    files.createDir(constants.path.userData);
    files.createDir(constants.path.tmp);
    // 2. Then copy/create contents if not found
    return Promise.all([
        new Promise (function (resolve, reject) {
            // Create a config file and schema.json
            if (!files.fileExists(constants.path.userConfig)) {
                // config.json
                files.copyFile(pathModule.join(constants.path.defaultDir, "/config.json"), constants.path.userConfig, function () {
                    // Also see if schema.json exist
                    if (!files.fileExists(constants.path.schema)) {
                        var data = "{ \"schema\": " + pkg.abricotine.schema + " }";
                        files.writeFile(data, constants.path.schema, resolve);
                    }
                });
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
            files.copyLocalDir(pathModule.join(constants.path.defaultDir, "/lang"), constants.path.languages, resolve);
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

function askForReset (callback) {
    var userChoice = dialog.showMessageBox({
        title: "Abricotine - Configuration update",
        message: "The current configuration is deprecated and need to be updated. Do you want to reset Abricotine configuration? \n\nWARNING: Your previous configuration (including custom templates and dictonaries) will be lost.",
        type: "question",
        buttons: ["No", "Yes (recommended)"],
        defaultId: 1
    });
    if (userChoice === 1) {
        creator.reset().then(callback);
    } else {
        callback();
    }
}

// Check schema (should be removed once the app becomes stable)
// Schema in package.json is increased on each breaking change in Abricotine (beta). When starting an updated version, the user will be ask to reset his configuration in order to avoid bugs.
creator.check = function () {
    return new Promise (function (resolve, reject) {
        // Read schema
        files.readFile(constants.path.schema, function (data) {
            // Non-matching schema
            if (!data || JSON.parse(data).schema != pkg.abricotine.schema) {
                return askForReset(resolve);
            }
            resolve();
        });
    });
};

module.exports = creator;
