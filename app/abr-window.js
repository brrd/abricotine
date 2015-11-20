/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrMenu = require.main.require("./abr-menu.js"),
    BrowserWindow = require("browser-window"),
    constants = require.main.require("./constants.js"),
    contextMenuTemplate = require.main.require("./menu-context.json"),
    defaultConfig = require.main.require("./config-default.json"),
    menuTemplate = require.main.require("./menu-window.json"),
    nconf = require('nconf');

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

// Config creation (config is specific to the window)
function createConfig () {
    var config = new nconf.Provider(); // https://github.com/indexzero/nconf/issues/39
    config.overrides({})
         .argv()
         .file(constants.path.userConfig)
         .defaults(defaultConfig);
    return config;
}

// Get window position and size
function smartWindowBounds (abrWin) {
    var windows = abrWin.abrApp.windows,
        prevWindow,
        bounds;
    // Get the prev opened window if exists (current window is not registered in abrApp.windows yet)
    for (var i=windows.length; i>=0; i--) {
        if (windows[i]) {
            prevWindow = windows[i];
            break;
        }
    }
    if (prevWindow) {
        // If exists, the new window will be positioned with a small gap from the previous one
        var gap = 20,
            prevBounds = prevWindow.browserWindow.getBounds();
        bounds = {
            x: prevBounds.x + gap,
            y: prevBounds.y + gap,
            width: prevBounds.width,
            height: prevBounds.height
        };
    } else {
        // Otherwise, get the position from config
        var config = abrWin.config.get("window");
        bounds = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height
        };
    }
    return bounds;
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
    var cloneTemplate = JSON.parse(JSON.stringify(menuTemplate)); // Electron modifies the template while building the menu so we need to clone it before
    this.menu = new AbrMenu(this, cloneTemplate, this.config);
    // Context
    this.contextMenu = new AbrMenu(this, contextMenuTemplate, this.config);
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
            bounds = smartWindowBounds(abrWin);
        win = new BrowserWindow({
            title: constants.appName || "Abricotine",
            icon: constants.path.icon,
            "min-width": 100,
            "min-height": 100,
            width: bounds.width || 800,
            height: bounds.height || 600,
            x: bounds.x,
            y: bounds.y,
            "auto-hide-menu-bar": typeof showMenubar !== "undefined" ? !showMenubar : false
        });

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
        win.on("close", function () {
            // Save window position before it's destroyed
            abrWin.savePosition();
        });
        win.on("closed", function () {
            // Destroy the window
            abrApp.windows[win.id] = null;
            win = null;
        });

        // Load window
        win.loadUrl("file://" + constants.path.window);

        // Open devtools on debug mode
        if (this.config.get("debug")) {
            win.openDevTools();
        }
    },

    // Save window position and window config
    savePosition: function () {
        var bounds = this.browserWindow.getBounds();
        this.config.set("window:x", bounds.x);
        this.config.set("window:y", bounds.y);
        this.config.set("window:width", bounds.width);
        this.config.set("window:height", bounds.height);
        this.config.save();
    }
};

module.exports = AbrWindow;
