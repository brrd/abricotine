var remote = require("remote"),
    AbrPane = require.main.require("./abr-pane.js"),
    cmInit = require.main.require("./cm-init.js"),
    commands = require.main.require("./commands.js"),
    constants = remote.require("./constants.js"),
    dialogs = require.main.require("./dialogs.js"),
    imageImport = require.main.require("./image-import.js"),
    IpcClient = require.main.require("./ipc-client.js"),
    exportHtml = require.main.require("./export-html.js"),
    files = require.main.require("../files.js"),
    parsePath = require("parse-filepath"),
    shell = require("shell"),
    spellchecker = require('spellchecker');

function AbrDocument () {
    var that = this;

    // IPC init
    var ipcClient = this.ipcClient = new IpcClient();

    // Listener for commands sent by the menu
    ipcClient.listenToCommands(function (command, parameters) {
        that.execCommand(command, parameters);
    });

    // Set theme
    this.setTheme("abricotine");

    // Init CodeMirror fist because most of methods rely on it
    cmInit(function (cm) {
        that.cm = cm;

        // Init pane
        that.pane = new AbrPane(that);

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

        // Autopreview and spellchecker init (depend on config)
        that.getConfig(undefined, function (config) {
            // Autopreview
            that.cm.setOption("autopreviewAllowedDomains", config["autopreview-domains"]);
            that.cm.setOption("autopreviewSecurity", config["autopreview-security"]);
            that.autopreviewTypes = config.autopreview;
            that.autopreview();
            // Spellchecker
            if (config.spellchecker.active) {
                that.setDictionary(config.spellchecker.language, config.spellchecker.src);
            }
        });

        // Listener for context menu
        document.addEventListener("contextmenu", function () {
            ipcClient.trigger("openContextMenu");
        }, false);

        // Listeners for cm events
        that.cm.on("changes", function (cm, changeObj) {
            // Window title update
            that.updateWindowTitle();
        });

        that.cm.on("cursorActivity", function (cm) {
            that.autopreview();
        });

        that.cm.on("drop", function (cm, event) {
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

        // Handle local keybindings that arent linked to a specific menu
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27) { // ESC
                // Exit Fullscreen
                var currentWindow = remote.getCurrentWindow();
                if (currentWindow.isFullScreen()) {
                    that.execCommand("toggleFullscreen", false);
                }
                // Clear search
                that.execCommand("clearSearch");
            }
        };
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
        this.path = path || '';
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
            callback2 = function (err) {
                if (err) {
                    return dialogs.fileAccessDenied(path, function () {
                        that.saveAs(callback);
                    });
                }
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
        var tmpThemesPath = constants.path.tmpThemes,
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
        var that = this;
        exportHtml(this, null, null, function (err, path) {
            if (err) {
                return dialogs.fileAccessDenied(path, function () {
                    that.exportHtml();
                });
            }
        });
    },

    viewInBrowser: function (forceNewPath) {
        if (forceNewPath === true || !this.tmpPreviewPath) {
            this.tmpPreviewPath = constants.path.tmp + "/" + Date.now() + "/preview.html";
        }
        var that = this,
            filePath = this.tmpPreviewPath;
        files.createDir(filePath);
        exportHtml(this, undefined, filePath, function (err, path) {
            if (err) {
                if (forceNewPath === true) {
                    // Second try, abort here
                    console.error(err);
                    return;
                }
                return that.viewInBrowser(forceNewPath);
            }
            shell.openExternal("file://" + filePath);
        });
    },

    // Inline autopreview
    autopreview: function (types) {
        var cm = this.cm;
        types = types || this.autopreviewTypes;
        cm.doc.eachLine( function (line) {
            cm.autopreview(line, types);
        });
    },

    toggleAutopreview: function (type) {
        var flag = this.autopreviewTypes[type];
        this.autopreviewTypes[type] = !flag;
        if (flag) {
            // Remove markers
            var selector = ".autopreview-" + type;
            this.cm.clearMarkers(selector);
        } else {
            // Or create markers for this autopreview
            var autopreviewConfig = {};
            autopreviewConfig[type] = true;
            this.autopreview(autopreviewConfig);
        }
        // The only reason to keep this config updated in main process is to save it as user preferences
        this.setConfig("autopreview:" + type, !flag);
    },

    toggleAutopreviewSecurity: function (flag) {
        if (typeof flag !== "boolean") {
            flag = this.cm.getOption("autopreviewSecurity");
        }
        this.cm.setOption("autopreviewSecurity", !flag);
        // If enabled, clear all marker before updating
        if (!flag) {
            this.cm.clearMarkers(".autopreview-iframe");
        }
        // Update iframe autopreview
        this.autopreview({ iframe: true });
        this.setConfig("autopreview-security", !flag);
    },

    // Spellchecker
    setDictionary: function (lang, path) {
        if (lang) {
            spellchecker.setDictionary(lang, path);
            // Refresh CodeMirror highlight + enable spelling
            this.cm.setOption("mode", "abr-spellcheck-on");
            this.setConfig("spellchecker:active", true);
            this.setConfig("spellchecker:language", lang);
        } else {
            // Disable spelling
            this.cm.setOption("mode", "abr-spellcheck-off");
            this.setConfig("spellchecker:active", false);
        }
    },

    // Returns the spellchecking function
    getSpellcheckFunc: function () {
        return spellchecker.isMisspelled;
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
    about: function () {
        dialogs.about();
    }
};

module.exports = AbrDocument;
