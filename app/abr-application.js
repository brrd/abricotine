/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrMenu = require.main.require("./abr-menu.js"),
    AbrWindow = require.main.require("./abr-window.js"),
    app = require.main.require("electron").app,
    BrowserWindow = require("electron").BrowserWindow,
    commands = require.main.require("./commands-main.js"),
    files = require.main.require("./files.js"),
    ipcServer = require.main.require("./ipc-server.js"),
    menuTemplate = require.main.require("./menu-window.json"),
    parsePath = require("parse-filepath"),
    themeLoader = require.main.require("./theme-loader.js");

function AbrApplication (osxOpenFilePaths) {
    // Windows reference
    this.windows = [];
    // IPC get & set
    this.ipcServer = new ipcServer(this);
    // Light menu (used only on OSX when all windows closed)
    this.menu = new AbrMenu(this, null, menuTemplate);
    // Compile LESS theme then open windows
    themeLoader.load("abricotine", this.run.bind(this, osxOpenFilePaths));
}

AbrApplication.prototype = {

    // trigger
    setWinPath: function (path, winId) {
        this.windows[winId].path = path;
    },

    updateRecentPaths: function (recentPaths) {
        if (recentPaths) {
            if (recentPaths.length > 0) {
                // May not work on all OS'es (electron doc says Windows and MacOS are OK, tests on Ubuntu 16 show it is OK too)
                // See: https://github.com/electron/electron/blob/master/docs/tutorial/desktop-environment-integration.md#recent-documents-windows--macos
                app.addRecentDocument(recentPaths[0]);
            }

            this.updateRecentPathsMenus(recentPaths);
        }
    },

    updateRecentPathsMenus: function(recentPaths) {
        this.menu.setRecentDocsMenu(recentPaths);

        for (var winId in this.windows) {
            if (!this.windows.hasOwnProperty(winId)) continue;
            var abrWin = this.windows[winId];
            if (abrWin) {
                // There are some cases when abrWin is null:
                // Scenario 1: using menu "File > Close Document" on Windows that has no doc
                // Scenario 2:
                //      1. Start Abricotine ==> Opens a new empty window
                //      2. Open one of the recent files using the "File > Recent" menu ==> Selected doc is opened in a new window (unlike the "File > Open menu")
                //      3. Close the empty window (the one opened when Abricotine started)
                //      4. Return the window opened at step 2, open a file using the "File > Open" menu
                abrWin.menu.setRecentDocsMenu(recentPaths);
            }
        }
    },

    clearRecentDocs: function(abrWin) {
        // See: https://github.com/electron/electron/blob/master/docs/tutorial/desktop-environment-integration.md#recent-documents-windows--macos
        app.clearRecentDocuments();
        // update storage
        var webContents = abrWin.browserWindow.webContents;
        webContents.send("command", "clearRecentDocs");
    },

    // trigger
    getPathToLoad: function (arg, winId, callback) {
        var win = this.getFocusedAbrWindow(winId),
            path = win ? win.path : null;
        if (typeof callback === "function") {
            callback(path);
        } else {
            return path;
        }
    },

    // trigger
    setConfig: function (args, winId, callback) {
        var abrWin = this.getFocusedAbrWindow(winId);
        if (!abrWin || typeof args.key === "undefined" || typeof args.value === "undefined") {
            return;
        }
        // Update window menu if needed (args.menu indicates the menu id)
        if (args.menu && typeof args.value === "boolean") {
            var menuItem = abrWin.menu.findItem(args.menu);
            if (menuItem) {
                menuItem.checked = args.value;
            }
        }
        // Set window config
        abrWin.config.set(args.key, args.value);
        // Save the config each time it is modified, so the next opened window would get the latest config
        abrWin.config.save(function (err) {
            if (typeof callback === "function") {
                callback(err);
            }
        });
    },

    // trigger
    getConfig: function (arg, winId, callback) {
        var abrWin = this.getFocusedAbrWindow(winId);
        if (!abrWin) {
            return;
        }
        var res = abrWin.config.get(arg);
        if (typeof callback === "function") {
            callback(res);
        } else {
            return res;
        }
    },

    open: function (path) {
        function getAbsPath (path) {
            return typeof path === "string" ? parsePath(path).absolute : null;
        }
        if (typeof path === "string") {
            new AbrWindow(this, getAbsPath(path));
        } else if (path && path.constructor === Array && path.length > 0) {
            for (var i=0; i<path.length; i++) {
                new AbrWindow(this, getAbsPath(path[i]));
            }
        } else {
            new AbrWindow(this, null);
        }
    },

    // Open documents in argv if exist, otherwise open a new document
    run: function (argv) {
        argv = argv && argv.length > 0 ? argv : process.argv;
        var argvDocs = argv.filter(function (element) {
                return element.substring(0, 2) !== "--" && files.isTextFile(element);
            });
        this.open(argvDocs);
    },

    getFocusedAbrWindow: function (winId) {
        winId = winId || BrowserWindow.getFocusedWindow().id;
        return this.windows[winId];
    },

    // trigger
    openContextMenu: function (arg, winId) {
        var abrWin = this.getFocusedAbrWindow(winId);
        abrWin.contextMenu.popup();
    },

    execCommand: function (command, parameters) {
        // send command to the focused window
        var win = BrowserWindow.getFocusedWindow();
        if (win) {
            return win.webContents.send("command", command, parameters);
        }
        // if no window, run a command from commands-main.js
        if (commands && commands[command]) {
            commands[command](this, parameters);
        } else {
            console.error("Unknown command '" + command + "'");
        }
    },

    showMenu: function () {
        this.menu.attach();
    }
};

module.exports = AbrApplication;
