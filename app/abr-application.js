var AbrWindow = require.main.require("./abr-window.js"),
    app = require("app"),
    BrowserWindow = require("browser-window"),
    constants = require.main.require("./constants.js"),
    files = require.main.require("./files.js"),
    ipcServer = require.main.require("./ipc-server.js"),
    parsePath = require("parse-filepath"),
    themeLoader = require.main.require("./theme-loader.js");

function AbrApplication () {
    // Windows reference
    this.windows = [];

    // IPC get & set
    this.ipcServer = new ipcServer(this);

    // Compile LESS theme then open windows
    var openWindows = (function (abrApp) {
        // Open files in argv if exist
        var numberOfWindowsOpened = abrApp.openDocumentsInArgv();
        if (numberOfWindowsOpened === 0) {
            abrApp.open();
        }
    })(this);
    themeLoader.load("abricotine", openWindows);
}

AbrApplication.prototype = {

    // trigger
    setWinPath: function (path, winId) {
        this.windows[winId].path = path;
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
        var abrWin = new AbrWindow(this, path);
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

    openDocumentsInArgv: function () {
        var argv = process.argv,
            numberOfWindowsOpened = 0,
            absPath;
        // Open windows depending on argv
        for (var i=0; i<argv.length; i++) {
            if (argv[i].substring(0, 2) !== "--" && files.isTextFile(argv[i])) {
                absPath = parsePath(argv[i]).absolute;
                this.open(absPath);
                numberOfWindowsOpened++;
            }
        }
        return numberOfWindowsOpened;
    }

};

module.exports = AbrApplication;
