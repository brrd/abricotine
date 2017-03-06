/*
 *   Abricotine - Markdown Editor
 *   Copyright (c) 2015 Thomas Brouard
 *   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
 */

var BrowserWindow = require("electron").BrowserWindow,
    constants = require.main.require("./constants.js"),
    dialog = require("electron").dialog,
    Localizer = require("./localize.js"),
    NativeImage = require("electron").nativeImage,
    parsePath = require("parse-filepath");

// Returns the most "logical" window object (it is quite useless actually)
function getWindow(win) {
    if (typeof win === "number") {
        return BrowserWindow.fromId(win);
    } else if (win instanceof BrowserWindow) {
        return win;
    } else if (win && typeof win.browserWindow !== "undefined") {
        return win.browserWindow;
    } else {
        return BrowserWindow.getFocusedWindow();
    }
}

var appDialogs = {

    // TODO get localizer instance from AbrApplication or AbrDocument (depending of current process)
    localizer: new Localizer(),

    about: function (win) {
        win = getWindow(win);
        var image = NativeImage.createFromPath(constants.path.icon),
            options = {
                title: appDialogs.localizer.get("about-title"),
                message: appDialogs.localizer.get("about-message", [constants.appVersion]),
                buttons: [appDialogs.localizer.get('button-ok')],
                icon: image,
                noLink: true
            };
        if (win) {
            dialog.showMessageBox(win, options);
        } else {
            dialog.showMessageBox(options);
        }
    },

    askClose: function (path, saveFunc, closeFunc, win) {
        if (!path) {
            path = appDialogs.localizer.get('new-document');
        }
        win = getWindow(win);
        var filename = parsePath(path).basename || path,
            userChoice = dialog.showMessageBox(win, {
                title: appDialogs.localizer.get('confirm-close-title'),
                message: appDialogs.localizer.get('confirm-close-message', [filename]),
                buttons: [appDialogs.localizer.get('button-cancel'), appDialogs.localizer.get('confirm-save-and-close'), appDialogs.localizer.get('confirm-close-without-saving')],
                defaultId: 2,
                noLink: true
            });
        switch (userChoice) {
            case 0:
                closeFunc();
                break;
            case 2:
                saveFunc(closeFunc);
                break;
        }
        return false;
    },

    askFileReload: function (path, callback, win) {
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
            title: appDialogs.localizer.get("changed-file"),
            message: appDialogs.localizer.get("changed-file-message", [path]),
            buttons: [appDialogs.localizer.get("button-yes"), appDialogs.localizer.get("button-no")],
            defaultId: 0,
            noLink: true
        });
        callback(userChoice === 0);
    },

    askOpenPath: function (title, win) {
        win = getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || appDialogs.localizer.get('dialog-open'),
            properties: ['openFile'],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askSavePath: function (title, win) {
        win = getWindow(win);
        var path = dialog.showSaveDialog(win, {
            title: title || appDialogs.localizer.get('dialog-save'),
            defaultPath: process.cwd()
        });
        if (path) {
            return path;
        }
        return false;
    },

    askOpenImage: function (title, win) {
        win = getWindow(win);
        var path = dialog.showOpenDialog(win, {
            title: title || appDialogs.localizer.get('insert-image'),
            properties: ['openFile'],
            filters: [{
                name: appDialogs.localizer.get('insert-image-filter'),
                extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg']
            }],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askNeedSave: function (abrDoc, callback, win) {
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
            title: appDialogs.localizer.get('dialog-save'),
            message: appDialogs.localizer.get('dialog-save-message'),
            buttons: [appDialogs.localizer.get('button-cancel'), appDialogs.localizer.get('button-save')],
            defaultId: 1,
            noLink: true
        });
        if (userChoice === 1) {
            abrDoc.save(null, callback);
        }
        return false;
    },

    fileAccessDenied: function (path, callback, win) {
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
            title: appDialogs.localizer.get("permission-denied"),
            message: appDialogs.localizer.get("permission-denied-message", [path]),
            buttons: [appDialogs.localizer.get('button-cancel'), appDialogs.localizer.get('button-ok')],
            defaultId: 1,
            noLink: true
        });
        if (userChoice === 1) {
            callback();
        }
        return false;
    },

    importImagesDone: function (path, win) {
        win = getWindow(win);
        dialog.showMessageBox(win, {
            title: appDialogs.localizer.get("images-copied"),
            message: appDialogs.localizer.get("images-copied-message", [path]),
            buttons: [appDialogs.localizer.get('button-ok')],
            noLink: true
        });
    },

    warnFileDeleted: function (path, callback, win) {
        win = getWindow(win);
        var userChoice = dialog.showMessageBox(win, {
            title: appDialogs.localizer.get("file-deleted"),
            message: appDialogs.localizer.get("file-deleted-message", [path]),
            buttons: [appDialogs.localizer.get("button-yes"), appDialogs.localizer.get("button-no")],
            defaultId: 0,
            noLink: true
        });
        callback(userChoice === 0);
    }
};

module.exports = appDialogs;
