var app = require("app"),
    BrowserWindow = require("browser-window"),
    constants = require.main.require("./constants.js");

function alreadyOpen (abrApp, path) {
    if (!path || !abrApp) {
        return;
    }
    var windows = abrApp.windows;
    for (var i=0; i<windows.length; i++) {
        if (windows[i] && windows[i].path === path) {
            return windows[i];
        }
    }
    return false;
}

function AbrWindow (abrApp, path) {
    this.abrApp = abrApp;
    if (path) {
        this.path = path;
        // Check if the called doc is already open
        var docWin = alreadyOpen(abrApp, path);
        if (docWin && docWin.browserWindow) {
            docWin.browserWindow.show();
            return;
        }
    }
    this.open();
}

AbrWindow.prototype = {
    open: function () {
        var abrWin = this,
            abrApp = this.abrApp,
            config = abrApp.config,
            win = null;
        // Open window
        win = new BrowserWindow({
            width: config.winWidth || 800,
            height: config.winHeight || 600,
            title: constants.appName || "Abricotine",
            "auto-hide-menu-bar": config.autoHideMenuBar || false,
            icon: app.getAppPath() + constants.appIconPath
        });
        // Register window in abrWin
        this.browserWindow = win;
        this.id = win.id;
        // Register this in abrApp
        abrApp.windows[win.id] = this;
        // Event handlers
        win.webContents.on("dom-ready", function () {
            win.show(); // NOTE: win.show() and win.focus() seems to be broken in Linux
        });
        win.on("closed", function() {
            abrApp.windows[win.id] = null;
            win = null;
        });
        // Load window
        win.loadUrl("file://" + app.getAppPath() + constants.indexHtml);
        win.openDevTools(); // TODO: remove this after debug
    }
};

module.exports = AbrWindow;
