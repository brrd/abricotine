/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrMenu = require.main.require("./abr-menu.js"),
    AbrWindow = require.main.require("./abr-window.js"),
    app = require.main.require("app"),
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
        this.storeRecentPath(path, winId);
    },

    storeRecentPath: function (path, winId) {
        //TODO recent-docs: storing does not work for the first opened doc
        if (path) {
            // Works only on Windows and MacOS
            // See: https://github.com/electron/electron/blob/master/docs/tutorial/desktop-environment-integration.md#recent-documents-windows--macos
            app.addRecentDocument(path);

            var max = this.getConfig("recent-docs:max", winId);
            if (!max) max = 5;
            var recentPaths = this.getConfig("recent-docs:files", winId);
            if (!recentPaths) recentPaths = [];
            var indexOfPath = recentPaths.indexOf(path);
            if (indexOfPath >= 0) {
                recentPaths.splice(indexOfPath, 1);
            }
            recentPaths.unshift(path);
            if (recentPaths.length > max) {
                recentPaths = recentPaths.slice(0, max);
            }
            this.setConfig({"recent-docs:files": recentPaths}, winId);
        }
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
