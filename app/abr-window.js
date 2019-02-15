/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrMenu = require.main.require("./abr-menu.js"),
    BrowserWindow = require("electron").BrowserWindow,
    constants = require.main.require("./constants.js"),
    contextMenuTemplate = require.main.require("./menu-context.json"),
    createConfig = require.main.require("./config.js"),
    menuTemplate = require.main.require("./menu-window.json"),
    windowStateKeeper = require('electron-window-state');

function alreadyOpen (abrApp, path) {
    if (!path || !abrApp) {
        return;
    }
    var windows = abrApp.windows;
    for (var i=0; i<windows.length; i++) {
        if (!windows[i]) continue;
        if (windows[i].path === path) {
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
    this.config = createConfig();
    this.menu = new AbrMenu(abrApp, this, menuTemplate, this.config);
    // Context
    this.contextMenu = new AbrMenu(abrApp, this, contextMenuTemplate, this.config);
    this.open();
}

AbrWindow.prototype = {

    // Send and exec a command in window
    execCommand: function (command, parameters) {
        this.browserWindow.webContents.send("command", command, parameters);
    },

    // Open a new window
    open: function () {
        var abrWin = this,
            abrApp = this.abrApp,
            config = this.config,
            win = null;

        // Update application menu
        this.menu.attach();

        // Create and open window
        var showMenubar = config.get("window:showMenuBar"),
            mainWindowState = windowStateKeeper({
                path: constants.path.userData,
                defaultWidth: 800,
                defaultHeight: 600
            });
        win = new BrowserWindow({
            title: constants.appName || "Abricotine",
            icon: constants.path.icon,
            minWidth: 100,
            minHeight: 100,
            x: mainWindowState.x,
            y: mainWindowState.y,
            width: mainWindowState.width,
            height: mainWindowState.height,
            autoHideMenuBar: typeof showMenubar !== "undefined" ? !showMenubar : false,
            webPreferences: { nodeIntegration: true }
        });
        mainWindowState.manage(win);

        // Register window in abrWin
        this.browserWindow = win;
        this.id = win.id;

        // Register this in abrApp
        abrApp.windows[win.id] = this;

        // Prepare startup commands
        var execStartupCommands = function () {
            var startupCommands = abrWin.config.get("startup-commands");
            for (var cmdName in startupCommands) {
                if (startupCommands[cmdName]) {
                    abrWin.execCommand(cmdName);
                }
            }
        };

        // Set event handlers
        win.webContents.on("dom-ready", function () {
            execStartupCommands();
            win.show(); // NOTE: win.show() and win.focus() seems to be broken in Linux
        });
        win.on("focus", function () {
            abrWin.menu.attach();
        });
        win.on("close", function (e) {
            e.preventDefault() // Prevents the window from closing
            abrWin.execCommand("closeWindow");
        });
        win.on("closed", function () {
            // Destroy the window
            abrApp.windows[abrWin.id] = null;
            win = null;
        });

        // Load window
        win.loadURL("file://" + constants.path.window);

        // Open devtools on startup when --debug flag is used
        if (this.config.get("debug")) {
            win.openDevTools();
        }
    }
};

module.exports = AbrWindow;
