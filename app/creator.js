/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var constants = require.main.require("./constants.js"),
    dialog = require("electron").dialog,
    files = require.main.require("./files.js"),
    Localizer = require.main.require("./localize.js"),
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
                files.copyLocalDir(pathModule.join(constants.path.defaultDir, "/dictionaries"), constants.path.dictionaries, resolve);
            } else {
                resolve();
            }
        }),
        new Promise (function (resolve, reject) {
            if (!files.dirExists(constants.path.languages)) {
                files.copyLocalDir(pathModule.join(constants.path.defaultDir, "/lang"), constants.path.languages, resolve);
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
        }),
        new Promise (function (resolve, reject) {
            // Copy default themes
            if (!files.dirExists(constants.path.themesDir)) {
                files.copyLocalDir(pathModule.join(constants.path.defaultDir, "/themes"), constants.path.themesDir, resolve);
            } else {
                resolve();
            }
        })
    ]);
};

// Erase the whole configuration + temporary files
creator.erase = function () {
    function getErasePromise (dirPath) {
      return new Promise (function (resolve, reject) {
          files.rm(dirPath, function (err) {
              if (err) reject(err);
              else resolve();
          });
      });
    }
    var p1 = getErasePromise(constants.path.userData);
    var p2 = getErasePromise(constants.path.tmp);
    return Promise.all([p1, p2]);
};

// Reset: erase then create a new clear config
creator.reset = function () {
    return creator.erase().then(creator.create);
};

function askForReset (callback) {
    //TODO use Localizer from AbrApplication
    var localizer = new Localizer();

    var userChoice = dialog.showMessageBox({
        title: localizer.get("reset-dialog"),
        message: localizer.get("reset-dialog-message"),
        type: "question",
        buttons: [localizer.get("button-no"), localizer.get("button-yes-recommended")],
        defaultId: 1,
        noLink: true
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
