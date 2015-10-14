var AbrWindow = require.main.require("./abr-window.js"),
    BrowserWindow = require("browser-window"),
    configBuilder = require.main.require("./config-builder.js"),
    contextMenuTemplate = require.main.require("./menu-context.json"),
    files = require.main.require("./files.js"),
    ipcServer = require.main.require("./ipc-server.js"),
    Menu = require("menu"),
    menuBuilder = require.main.require("./menu-builder.js"),
    menuTemplate = require.main.require("./menu-window.json"),
    parsePath = require("parse-filepath");

function AbrApplication () {
    // Windows reference { id: documentPath }
    this.windows = [];

    /* Config */
    this.config = configBuilder.build();

    // IPC get & set
    this.ipcServer = new ipcServer(this);

    /* Menu + context menu */
    this.menu = menuBuilder.build(menuTemplate, this.config);
    Menu.setApplicationMenu(this.menu);
    this.contextMenu = menuBuilder.build(contextMenuTemplate, this.config);

    /* Open files in argv if exist */
    var numberOfWindowsOpened = this.openDocumentsInArgv();
    if (numberOfWindowsOpened === 0) {
        this.open();
    }
}

AbrApplication.prototype = {

    // FIXME: erreur on close quand plusieurs fenetres ouvertes (x error)

    // TODO: separer les triggers ?

    // trigger
    setWinPath: function (path, winId) {
        this.windows[winId].path = path;
    },

    // trigger
    getPathToLoad: function (arg, winId, callback) {
        var win = this.windows[winId],
            path = win ? win.path : null;
        if (typeof callback === "function") {
            callback(path);
        } else {
            return path;
        }
    },

    open: function (path) {
        var abrWin = new AbrWindow(this, path);
    },

    // trigger
    // TODO: peut-etre plutot une commande ?
    openContextMenu: function (args) {
        var win = BrowserWindow.getFocusedWindow();
        this.contextMenu.popup(win);
    },

    openDocumentsInArgv: function () {
        var argv = process.argv,
            numberOfWindowsOpened = 0,
            absPath;
        // Open windows depending on argv
        for (var i=0; i<argv.length; i++) {
            if (files.isTextFile(argv[i])) {
                absPath = parsePath(argv[i]).absolute;
                this.open(absPath);
                numberOfWindowsOpened++;
            }
        }
        return numberOfWindowsOpened;
    }

};

module.exports = AbrApplication;
