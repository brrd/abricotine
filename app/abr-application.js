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
    constants = require.main.require("./constants.js"),
    createConfig = require.main.require("./config.js"),
    Dialogs = require.main.require("./dialogs.js"),
    files = require.main.require("./files.js"),
    ipcServer = require.main.require("./ipc-server.js"),
    Localizer = require("./localize.js"),
    menuTemplate = require.main.require("./menu-window.json"),
    parsePath = require("parse-filepath");

function AbrApplication (osxOpenFilePaths) {
    // Config
    this.config = createConfig();
    // Localizer
    this.localizer = new Localizer(this.config.get("lang"));
    // Dialogs
    this.dialogs = new Dialogs(this.localizer);
    // Windows reference
    this.windows = [];
    // IPC get & set
    this.ipcServer = new ipcServer(this);
    // Light menu (used only on OSX when all windows closed)
    this.menu = new AbrMenu(this, null, menuTemplate);
    // Open window(s)
    this.run(osxOpenFilePaths);
}

AbrApplication.prototype = {

    // trigger
    setWinPath: function (path, winId) {
        this.windows[winId].path = path;
    },

    updateRecentPaths: function (recentPaths) {
        if (recentPaths) {
            if (recentPaths.length > 0) {
                // Works only on Windows and MacOS
                // See: https://github.com/electron/electron/blob/master/docs/tutorial/desktop-environment-integration.md#recent-documents-windows--macos
                app.addRecentDocument(recentPaths[0]);
            }
            this.menu.setRecentDocsMenu(recentPaths);

            for (var winId in this.windows) {
                if (!this.windows.hasOwnProperty(winId)) continue;
                var abrWin = this.windows[winId];
                abrWin.menu.setRecentDocsMenu(recentPaths);
            }
        }
    },

    clearRecentDocs: function(abrWin) {
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
        if (typeof args.key === "undefined" || typeof args.value === "undefined") {
            return;
        }
        var abrWin = this.getFocusedAbrWindow(winId),
            config = abrWin ? abrWin.config : this.config;
        // Update window menu if needed (args.menu indicates the menu id)
        if (args.menu && typeof args.value === "boolean") {
            var menuItem = abrWin.menu.findItem(args.menu);
            if (menuItem) {
                menuItem.checked = args.value;
            }
        }
        // Set config
        config.set(args.key, args.value);
        // Save the config each time it is modified, so the next opened window would get the latest config
        config.save(function (err) {
            if (typeof callback === "function") {
                callback(err);
            }
        });
    },

    // trigger
    getConfig: function (arg, winId, callback) {
        var abrWin = this.getFocusedAbrWindow(winId),
            config = abrWin ? abrWin.config : this.config,
            res = config.get(arg);
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
    },

    emptyTmpHTML: function () {
        var path = constants.path.tmp + "/!(themes)";
        files.rm(path, error => {
            if (error) {
                console.error(`Could not delete file at ${error.path}`, error);
            }
        });
    }
};

module.exports = AbrApplication;
