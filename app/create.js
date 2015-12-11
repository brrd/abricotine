/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var defaultUserConfig = require.main.require("./config-user-default.json"),
    constants = require.main.require("./constants.js"),
    files = require.main.require("./files.js");

// Export a Promise
module.exports = Promise.all([
    new Promise (function (resolve, reject) {
        // Create the app folder if it doesn't already exist (sync)
        files.createDir(constants.path.userData);
        // Create the temp folder (sync)
        files.createDir(constants.path.tmp);
        resolve();
    }),
    new Promise (function (resolve, reject) {
        // Create a config file if not found
        if (!files.fileExists(constants.path.userConfig)) {
            files.writeFile(JSON.stringify(defaultUserConfig), constants.path.userConfig, resolve);
        } else {
            resolve();
        }
    }),
    new Promise (function (resolve, reject) {
        // Copy default dicts if needed
        if (!files.dirExists(constants.path.dictionaries)) {
            files.copyLocalDir(constants.path.dictionariesLocal, constants.path.dictionaries, resolve);
        } else {
            resolve();
        }
    })
]);
