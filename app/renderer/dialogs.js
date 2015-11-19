var remote = require("remote"),
    app = remote.require("app"),
    dialog = remote.require("dialog"),
    NativeImage = remote.require("native-image"),
    utils = require.main.require("../utils.js"),
    parsePath = require("parse-filepath"),
    pkg = require.main.require("../../package.json");

var appDialogs = {

    about: function (win) {
        win = utils.getWindow(win);
        var image = NativeImage.createFromPath(app.getAppPath() + "/abricotine.png"),
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
    },

    askNeedSave: function (abrDoc, callback, win) {
        win = utils.getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
                title: 'Save document',
                message: 'The current document needs to be saved before performing this operation.',
                buttons: ['Cancel', 'Save document']
            });
        if (userChoice === 1) {
            abrDoc.save(null, callback);
        }
        return false;
    },

    fileAccessDenied: function (path, callback, win) {
        win = utils.getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
            title: "Permission denied",
            message: "The file '" + path + "' could not be written: permission denied. Please choose another path.",
            buttons: ['Cancel', 'OK']
        });
        if (userChoice === 1) {
            callback();
        }
        return false;
    },

    importImagesDone: function (path, win) {
        win = utils.getWindow(win);
        dialog.showMessageBox(win, {
            title: "Images copied",
            message: "Document images have been copied in the '" + path + "' directory.",
            buttons: ['OK']
        });
    }
};

module.exports = appDialogs;
