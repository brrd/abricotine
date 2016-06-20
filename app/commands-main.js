/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var app = require("electron").app,
    dialogs = require("./dialogs.js"),
    constants = require("./constants.js"),
    shell = require("electron").shell;

// Commands used in the main process (for OSX menu when no opened windows)
var commands = {
    new: function (abrApp) {
        abrApp.open();
    },

    open: function (abrApp) {
        var path = dialogs.askOpenPath();
        if (!path) {
            return false;
        }
        abrApp.open(path);
    },

    quit: function (abrApp) {
        app.quit();
    },

    editConfigFile: function (abrApp) {
        var dirPath = constants.path.userConfig;
        shell.openItem(dirPath);
    },

    openConfigDir: function (abrApp) {
        var dirPath = constants.path.userData;
        shell.openItem(dirPath);
    },

    about: function (abrApp) {
        dialogs.about();
    },

    homepage: function (win, abrDoc, cm) {
        var homepageURL = constants.homepageURL;
        shell.openExternal(homepageURL);
    }
};

module.exports = commands;
