var remote = require("remote"),
    AbrPane = require.main.require("./js/abr-pane.js"),
    app = remote.require("app"),
    cmInit = require.main.require("./js/cm-init.js"),
    commands = require.main.require("./js/commands.js"),
    dialogs = require.main.require("./js/dialogs.js"),
    imageImport = require.main.require("./js/image-import.js"),
    IpcClient = require.main.require("./js/ipc-client.js"),
    exportHtml = require.main.require("./js/export-html.js"),
    files = require.main.require("../files.js"),
    parsePath = require("parse-filepath"),
    shell = require("shell");

function AbrDocument () {
    var that = this;

    // IPC init
    var ipcClient = this.ipcClient = new IpcClient();

    // Listener for commands sent by the menu
    ipcClient.listenToCommands(function (command, parameters) {
        that.execCommand(command, parameters);
    });

    // Theme, CodeMirror and pane init
    this.setTheme("abricotine");
    this.cm = cmInit();
    this.pane = new AbrPane(this);

    // Check if there is a doc to load
    ipcClient.trigger("getPathToLoad", undefined, function (path) {
        if (path) {
            files.readFile(path, function (data, path) {
                that.clear(data, path);
            });
        } else {
            that.clear();
        }
    });

    // Preview init
    this.getConfig("preview", function (types) {
        that.previewTypes = types;
        that.preview();
    });

    // Listener for context menu
    document.addEventListener("contextmenu", function () {
        ipcClient.trigger("openContextMenu");
    }, false);

    // Listeners for cm events
    this.cm.on("changes", function (cm, changeObj) {
        // Window title update
        that.updateWindowTitle();
    });

    this.cm.on("cursorActivity", function (cm) {
        that.preview();
    });

    this.cm.on("drop", function (cm, event) {
        event.preventDefault();
        var file = event.dataTransfer.files[0];
        if (file && file.path) {
            // If it's an image, insert it
            var ext = parsePath(file.path).extname,
                allowedImages = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
            for (var i=0; i<allowedImages.length; i++) {
                if (ext === allowedImages[i]) {
                    that.insertImage(file.path);
                    return;
                }
            }
            // Otherwise try to open the file
            that.open(file.path);
        }
    });

    // Refresh editor when math is previewed
    window.MathJax.Hub.Register.MessageHook("New Math", function (message) {
        that.cm.refresh();
    });
}

AbrDocument.prototype = {

    // Clear editor
    clear: function (value, path) {
        value = value || '';
        path = path || '';
        this.setPath(path); // Must be done before everything else because it sets process.chdir
        this.cm.doc.setValue(value);
        this.cm.doc.clearHistory();
        this.setClean();
        this.updateWindowTitle();
        this.cm.refresh(); // CodeMirror scrollbar bug workaround
    },

    close: function (force) {
        var that = this,
            closeFunc = function () {
                that.clear();
            };
        if (!force && !this.isClean()) {
            dialogs.askClose(this, closeFunc);
        } else {
            closeFunc();
        }
    },

    // Path
    setPath: function (path) {
        this.path = path || ''; // TODO: may store the parsed path in here for better perfs
        if (this.path) {
            var dir = parsePath(this.path).dirname;
            if (dir) {
                process.chdir(dir);
            }
        }
    },

    // Data
    getData: function () {
        return this.cm.doc.getValue();
    },

    setData: function (data) {
        return this.cm.doc.setValue(data);
    },

    clearData: function () {
        return this.cm.doc.setValue("");
    },

    // Exec commands
    execCommand: function (command, parameters) {
        var win = remote.getCurrentWindow(),
            abrDoc = this;
        if (commands && commands[command]) {
            commands[command](win, abrDoc, abrDoc.cm, parameters);
        } else {
            console.error("Unknown command '" + command + "'");
        }
    },

    // Generations and clean state
    getGeneration: function () {
        return this.cm.doc.changeGeneration();
    },

    setClean: function () {
        this.latestGeneration = this.getGeneration();
    },

    isClean: function () {
        return this.cm.doc.isClean(this.latestGeneration);
    },

    // Window title
    updateWindowTitle: function () {
        var appName = "Abricotine",
            isClean = this.isClean(),
            saveSymbol = "*",
            parsedPath,
            dir,
            title;
        if (this.path) {
            parsedPath = parsePath(this.path);
            dir = parsedPath.dirname || process.cwd();
            title = parsedPath.basename + " - " + dir + " - " + appName;
        } else {
            title = "New document - " + appName;
        }
        if (!isClean) {
            title = saveSymbol + title;
        }
        document.title = title;
    },

    // Files or/and windows operations
    new: function () {
        if (!this.path && this.isClean()) {
            return;
        }
        return this.ipcClient.trigger("open");
    },

    open: function (path) {
        path = path || dialogs.askOpenPath();
        if (!path) {
            return false;
        }
        var that = this;
        if (!this.path && this.isClean()) {
            files.readFile(path, function (data, path) {
                that.clear(data, path);
            });
            return this.ipcClient.trigger("setWinPath", path);
        } else {
            return this.openNewWindow(path);
        }
    },

    openNewWindow: function (path) {
        path = path || dialogs.askOpenPath();
        if (!path) {
            return false;
        }
        return this.ipcClient.trigger("open", path);
    },

    save: function (path, callback) {
        path = path || this.path;
        if (!path) {
            return this.saveAs(callback);
        }
        var that = this,
            data = this.getData(),
            callback2 = function () {
                that.setClean();
                that.setPath(path);
                that.updateWindowTitle();
                if (typeof callback === "function") {
                    callback();
                }
            };
        return files.writeFile(data, path, callback2);
    },

    saveAs: function (callback) {
        // TODO: handle readonly file
        var path = dialogs.askSavePath();
        if (!path) {
            return false;
        }
        // Append extension if none
        if (path.indexOf(".") === -1) {
            path += ".md";
        }
        return this.save(path, callback);
    },

    // Themes
    setTheme: function (themeName) {
        themeName = themeName || "abricotine";
        var tmpThemesPath = app.getPath("temp") + "/Abricotine/themes",
            path = tmpThemesPath + "/" + themeName + ".css";
        $("#theme").attr("href", path);
    },

    // Images
    insertImage: function (path) {
        path = path || dialogs.askOpenImage();
        if (!path) {
            return false;
        }
        this.cm.draw("image", path);
    },

    imageImport: function (destFolder, updateEditor) {
        updateEditor = updateEditor === false ? false : true;
        imageImport(this, destFolder, updateEditor);
    },

    // Export
    exportHtml: function () {
        exportHtml(this);
    },

    viewInBrowser: function () {
        // TODO: store the previewId in abrDoc and overwrite preview
        var filePath = app.getPath("temp") + "/Abricotine/" + Date.now() + "/preview.html";
        files.createDir(filePath);
        exportHtml(this, undefined, filePath, function() {
            shell.openExternal("file://" + filePath);
        });
    },

    // Inline Preview
    // TODO: harmo nom autopreview
    preview: function (types) {
        var cm = this.cm;
        types = types || this.previewTypes;
        cm.doc.eachLine( function (line) {
            cm.preview(line, types);
        });
    },

    togglePreview: function (type) {
        var flag = this.previewTypes[type];
        this.previewTypes[type] = !flag;
        if (flag) {
            // Remove markers
            var selector = ".autopreview-" + type;
            this.cm.clearMarkers(selector);
        } else {
            // Or create markers for this preview
            var previewConfig = {};
            previewConfig[type] = true;
            this.preview(previewConfig);
        }
        // The only reason to keep this config updated in main process is to save it as user preferences
        this.setConfig("preview:" + type, !flag);
    },

    // Config
    setConfig: function (key, value, callback) {
        var args = {
                key: key,
                value: value
            };
        this.ipcClient.trigger("setConfig", args, callback);
    },

    getConfig: function (key, callback) {
        this.ipcClient.trigger("getConfig", key, callback);
    },

    // About
    // TODO: passer ça dans commands
    about: function () {
        // TODO: add to menu
        dialogs.about();
    }
};

module.exports = AbrDocument;
