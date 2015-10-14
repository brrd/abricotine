var remote = require("remote"),
    dialog = remote.require("dialog"),
    NativeImage = remote.require("native-image"),
    utils = require.main.require("../utils.js"),
    parsePath = require("parse-filepath"),
    pkg = require.main.require("../../package.json");

var appDialogs = {

    about: function (win) {
        win = utils.getWindow(win);
        var image = NativeImage.createFromPath("abricotine.png"),
            userChoice = dialog.showMessageBox(win, {
                title: "Abricotine",
                message: "Abricotine v. " + pkg.version + "\nLICENCE", // TODO: licence informations
                buttons: ['OK'],
                icon: image
            });
    },

    askClose : function (abrDoc, closeFunc, win) {
        var path = abrDoc.path;
        if (!path) {
            path = 'New document';
        }
        win = utils.getWindow(win);
        closeFunc = closeFunc || win.destroy; // win.close() would trigger the 'onbeforeunload' event again
        var filename = parsePath(path).basename || path,
            userChoice = dialog.showMessageBox(win, {
                title: 'Unsaved document',
                message: 'Do you really want to close \'' + filename + '\' without saving?',
                buttons: ['Cancel', 'Save & close', 'Close without saving']
            });
        switch (userChoice) {
            case 1:
                abrDoc.save(null, closeFunc);
                break;
            case 2:
                closeFunc();
                break;
        }
        return false;
    },

    askOpenPath: function (title, win) {
        win = utils.getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || 'Open document',
            properties: ['openFile'],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askSavePath: function (title, win) {
        win = utils.getWindow(win);
        var path = dialog.showSaveDialog(win, {
            title: title || 'Save document',
            defaultPath: process.cwd()
        });
        if (path) {
            return path;
        }
        return false;
    },

    askOpenImage: function (title, win) {
        win = utils.getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || 'Insert image',
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] }],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    }
};

module.exports = appDialogs;
