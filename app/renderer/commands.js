/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("electron").remote,
    clipboard = require('electron').clipboard,
    constants = remote.require("./constants.js"),
    md2html = require.main.require("./md2html.js"),
    shell = require('electron').shell;

var commands = {

    /* File */

    new: function(win, abrDoc, cm) {
        abrDoc.new();
    },

    open: function(win, abrDoc, cm) {
        abrDoc.open();
    },

    save: function(win, abrDoc, cm) {
        abrDoc.save();
    },

    saveAs: function(win, abrDoc, cm) {
        abrDoc.saveAs();
    },

    autosave: function(win, abrDoc, cm) {
        abrDoc.autosave();
    },

    exportHtml: function(win, abrDoc, cm, param) {
        abrDoc.exportHtml(param);
    },

    close: function(win, abrDoc, cm) {
        abrDoc.close();
    },

    // Replaced by "role" in menu
    closeWindow: function(win, abrDoc, cm) {
        abrDoc.close(false, true);
    },

    quit: function(win, abrDoc, cm) {
        remote.app.quit();
    },

    /* Edit */

    // Replaced by "role" in menu
    undo: function(win, abrDoc, cm) {
        cm.execCommand("undo");
    },

    // Replaced by "role" in menu
    redo: function(win, abrDoc, cm) {
        cm.execCommand("redo");
    },

    // Replaced by "role" in menu
    copy: function(win, abrDoc, cm) {
        document.execCommand("copy");
    },

    copyHtml: function(win, abrDoc, cm) {
        var data = cm.doc.getSelection("\n"),
            html = md2html(data);
        clipboard.writeText(html);
    },

    copyRTF: function(win, abrDoc, cm) {
        var data = cm.doc.getSelection("\n"),
            html = md2html(data),
            text = $(html).text();
        clipboard.write({
            text: text,
            html: html
        });
    },

    // Replaced by "role" in menu
    cut: function(win, abrDoc, cm) {
        document.execCommand("cut");
    },

    // Replaced by "role" in menu
    paste: function(win, abrDoc, cm) {
        document.execCommand("paste");
    },

    find: function(win, abrDoc, cm) {
        $(".CodeMirror-dialog").remove(); // FIXME: error when double key
        cm.execCommand("clearSearch");
        cm.execCommand("find");
    },

    findNext: function(win, abrDoc, cm) {
        $(".CodeMirror-dialog").remove(); // FIXME: error when double key
        cm.execCommand("findNext");
    },

    findPrev: function(win, abrDoc, cm) {
        $(".CodeMirror-dialog").remove(); // FIXME: error when double key
        cm.execCommand("findPrev");
    },

    replace: function(win, abrDoc, cm) {
        $(".CodeMirror-dialog").remove(); // FIXME: error when double key
        cm.execCommand("clearSearch");
        cm.execCommand("replace");
    },

    replaceAll: function(win, abrDoc, cm) {
        $(".CodeMirror-dialog").remove(); // FIXME: error when double key
        cm.execCommand("clearSearch");
        cm.execCommand("replaceAll");
    },

    clearSearch: function(win, abrDoc, cm) {
        $(".CodeMirror-dialog").remove(); // FIXME: error when double key
        cm.execCommand("clearSearch");
    },

    // Replaced by "role" in menu
    selectAll: function(win, abrDoc, cm) {
        cm.execCommand("selectAll");
    },

    setDictionary: function (win, abrDoc, cm, params) {
        var lang = params[0],
            path = params[1];
        abrDoc.setDictionary(lang, path);
    },

    autoCloseBrackets: function(win, abrDoc, cm) {
        if (cm) {
            var flag = cm.getOption("autoCloseBrackets");
            cm.setOption("autoCloseBrackets", !flag);
            abrDoc.setConfig("startup-commands:autoCloseBrackets", !flag);
        } else {
            // If cm not loaded yet
            abrDoc.commandsToTrigger.push("autoCloseBrackets");
        }
    },

    autoSaveOnFocusLost: function(win, abrDoc, cm) {
        if (cm) {
            var flag = cm.getOption("autoSaveOnFocusLost");
            cm.setOption("autoSaveOnFocusLost", !flag);
            abrDoc.setConfig("startup-commands:autoSaveOnFocusLost", !flag);
        } else {
            // If cm not loaded yet
            abrDoc.commandsToTrigger.push("autoSaveOnFocusLost");
        }
    },

    loadTheme: function (win, abrDoc, cm, param) {
        abrDoc.loadTheme(param);
        abrDoc.setConfig("theme", param);
    },

    reloadTheme: function (win, abrDoc, cm) {
        abrDoc.reloadTheme();
    },

    editConfigFile: function(win, abrDoc, cm) {
        var dirPath = constants.path.userConfig;
        shell.openItem(dirPath);
    },

    /* Format */

    format: function (win, abrDoc, cm, param) {
        if (typeof param !== "undefined") {
            cm.format(param);
        }
    },

    /* Insert */

    imageFromComputer: function(win, abrDoc, cm) {
        abrDoc.insertImage();
    },

    imagesImportAll: function(win, abrDoc, cm) {
        abrDoc.imageImport();
    },

    /* Table */

    tableCreate: function(win, doc, cm, parameters) {
        if (typeof parameters === "undefined") {
            cm.tableCreate();
        } else {
            cm.tableCreate.apply(cm, parameters);
        }
    },

    tableBeautify: function(win, abrDoc, cm) {
        cm.tableDo("beautify");
    },

    tableAlignLeft: function(win, abrDoc, cm) {
        cm.tableDo("align", null, "left");
    },

    tableAlignCenter: function(win, abrDoc, cm) {
        cm.tableDo("align", null, "center");
    },

    tableAlignRight: function(win, abrDoc, cm) {
        cm.tableDo("align", null, "right");
    },

    tableAlignClear: function(win, abrDoc, cm) {
        cm.tableDo("align", null, null);
    },

    tableAddRowBefore: function(win, abrDoc, cm) {
        cm.tableDo("addRowsBeforeCursor");
    },

    tableAddRowAfter: function(win, abrDoc, cm) {
        cm.tableDo("addRowsAfterCursor");
    },

    tableAddColBefore: function(win, abrDoc, cm) {
        cm.tableDo("addColsBeforeCursor");
    },

    tableAddColAfter: function(win, abrDoc, cm) {
        cm.tableDo("addColsAfterCursor");
    },

    tableRemoveRow: function(win, abrDoc, cm) {
        cm.tableDo("removeRows");
    },

    tableRemoveCol: function(win, abrDoc, cm) {
        cm.tableDo("removeCols");
    },

    /* View */

    viewInBrowser: function(win, abrDoc, cm) {
        abrDoc.viewInBrowser();
    },

    increaseFontSize: function (win, abrDoc, cm) {
        abrDoc.addFontSize(2);
    },

    decreaseFontSize: function (win, abrDoc, cm) {
        abrDoc.addFontSize(-2);
    },

    resetFontSize: function (win, abrDoc, cm) {
        abrDoc.setFontSize(16);
    },

    showMenuBar: function(win, abrDoc, cm) {
        var flag = win.isMenuBarAutoHide();
        win.setAutoHideMenuBar(!flag);
        win.setMenuBarVisibility(flag);
        abrDoc.setConfig("window:showMenuBar", flag);
    },

    showBlocks: function(win, abrDoc, cm) {
        $("body").toggleClass("show-blocks");
        var flag = $("body").hasClass("show-blocks");
        abrDoc.setConfig("startup-commands:showBlocks", flag);
    },

    showLastLineIndicator: function(win, abrDoc, cm) {
        $("body").toggleClass("show-last-line-indicator");
        var flag = $("body").hasClass("show-last-line-indicator");
        abrDoc.setConfig("startup-commands:showLastLineIndicator", flag);
    },

    showHiddenCharacters: function(win, abrDoc, cm) {
        $("body").toggleClass("show-hidden-characters");
        var flag = $("body").hasClass("show-hidden-characters");
        abrDoc.setConfig("startup-commands:showHiddenCharacters", flag);
    },

    showTocPane: function(win, abrDoc, cm) {
        $("body").toggleClass("pane-visible");
        var flag = $("body").hasClass("pane-visible");
        abrDoc.setConfig("startup-commands:showTocPane", flag);
    },

    toggleAutopreview: function(win, abrDoc, cm, param) {
        abrDoc.toggleAutopreview(param);
    },

    toggleAutopreviewSecurity: function (win, abrDoc, cm, param) {
        abrDoc.toggleAutopreviewSecurity(param);
    },

    toggleFullscreen: function(win, abrDoc, cm, flag) {
        flag = typeof flag === "boolean" ? flag : !win.isFullScreen();
        win.setFullScreen(flag);
        win.setMenuBarVisibility(!flag);
    },

    /* Developer */

    devtools: function(win, abrDoc, cm) {
        win.toggleDevTools();
    },

    reload: function(win, abrDoc, cm) {
        abrDoc.close(true);
        win.webContents.reloadIgnoringCache();
    },

    openConfigDir: function(win, abrDoc, cm) {
        var dirPath = constants.path.userData;
        shell.openItem(dirPath);
    },

    openTempDir: function(win, abrDoc, cm) {
        var dirPath = constants.path.tmp;
        shell.openItem(dirPath);
    },

    openAppDir: function(win, abrDoc, cm) {
        var dirPath = constants.path.app;
        shell.openItem(dirPath);
    },

    execCommand: function(win, abrDoc, cm) {
        $(".CodeMirror-dialog").remove(); // FIXME: error when double key
        var html = "Command: <input type='text'/>",
            callback = function(query) {
                if (!query) return;
                abrDoc.execCommand(query);
                abrDoc.cm.focus();
            };
        cm.openDialog(html, callback);
    },

    /* Help */

    about: function (win, abrDoc, cm) {
        abrDoc.about();
    },

    homepage: function (win, abrDoc, cm) {
        var homepageURL = constants.homepageURL;
        shell.openExternal(homepageURL);
    }
};

module.exports = commands;
