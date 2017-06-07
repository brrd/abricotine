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
    parsePath = require("parse-filepath"),
    pathModule = require("path");

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

function Dialogs (localizer, win, dirpath) {
    this.localizer = localizer || new Localizer();
    this.win = getWindow(win);
    this.setDir(dirpath);
}

Dialogs.prototype = {

    // Set the current doc dir path, otherwise use "My Documents" path
    setDir: function (dirpath) {
        this.dir = dirpath || constants.path.documents;
    },

    about: function () {
        var image = NativeImage.createFromPath(constants.path.icon),
            options = {
                title: this.localizer.get("about-title"),
                message: this.localizer.get("about-message", [constants.appVersion]),
                buttons: [this.localizer.get('button-ok')],
                icon: image,
                noLink: true
            };
        if (this.win) {
            dialog.showMessageBox(this.win, options);
        } else {
            dialog.showMessageBox(options);
        }
    },

    askClose: function (path, saveFunc, closeFunc) {
        if (!path) {
            path = this.localizer.get('new-document');
        }
        var filename = parsePath(path).basename || path,
            userChoice = dialog.showMessageBox(this.win, {
                title: this.localizer.get('confirm-close-title'),
                message: this.localizer.get('confirm-close-message', [filename]),
                buttons: [this.localizer.get('button-cancel'), this.localizer.get('confirm-close-without-saving'), this.localizer.get('confirm-save-and-close')],
                defaultId: 2,
                noLink: true
            });
        switch (userChoice) {
            case 1:
                closeFunc();
                break;
            case 2:
                saveFunc(closeFunc);
                break;
        }
        return false;
    },

    askFileReload: function (path, callback) {
        var userChoice = dialog.showMessageBox(this.win, {
            title: this.localizer.get("changed-file"),
            message: this.localizer.get("changed-file-message", [path]),
            buttons: [this.localizer.get("button-yes"), this.localizer.get("button-no")],
            defaultId: 0,
            noLink: true
        });
        callback(userChoice === 0);
    },

    askOpenPath: function (title) {
        var path = dialog.showOpenDialog(this.win, {
            title: title || this.localizer.get('dialog-open'),
            properties: ['openFile'],
            defaultPath: this.dir
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askSavePath: function (title, docTitle) {
        docTitle = docTitle || "";
        var path = dialog.showSaveDialog(this.win, {
            title: title || this.localizer.get('dialog-save'),
            defaultPath: pathModule.join(this.dir, docTitle)
        });
        if (path) {
            return path;
        }
        return false;
    },

    askOpenImage: function (title) {
        var path = dialog.showOpenDialog(this.win, {
            title: title || this.localizer.get('insert-image'),
            properties: ['openFile'],
            filters: [{
                name: this.localizer.get('insert-image-filter'),
                extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg']
            }],
            defaultPath: this.dir
        });
        if (path) {
            return path[0];
        }
        return false;
    },

    askNeedSave: function (abrDoc, callback) {
        var userChoice = dialog.showMessageBox(this.win, {
            title: this.localizer.get('dialog-save'),
            message: this.localizer.get('dialog-save-message'),
            buttons: [this.localizer.get('button-cancel'), this.localizer.get('button-save')],
            defaultId: 1,
            noLink: true
        });
        if (userChoice === 1) {
            abrDoc.save(null, callback);
        }
        return false;
    },

    fileAccessDenied: function (path, callback) {
        var userChoice = dialog.showMessageBox(this.win, {
            title: this.localizer.get("permission-denied"),
            message: this.localizer.get("permission-denied-message", [path]),
            buttons: [this.localizer.get('button-cancel'), this.localizer.get('button-ok')],
            defaultId: 1,
            noLink: true
        });
        if (userChoice === 1) {
            callback();
        }
        return false;
    },

    importImagesDone: function (path) {
        dialog.showMessageBox(this.win, {
            title: this.localizer.get("images-copied"),
            message: this.localizer.get("images-copied-message", [path]),
            buttons: [this.localizer.get('button-ok')],
            noLink: true
        });
    },

    warnFileDeleted: function (path, callback) {
        var userChoice = dialog.showMessageBox(this.win, {
            title: this.localizer.get("file-deleted"),
            message: this.localizer.get("file-deleted-message", [path]),
            buttons: [this.localizer.get("button-yes"), this.localizer.get("button-no")],
            defaultId: 0,
            noLink: true
        });
        callback(userChoice === 0);
    }
};

module.exports = Dialogs;
