/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("remote"),
    clipboard = require('clipboard'),
    constants = remote.require("./constants.js"),
    kramed = require("kramed"),
    shell = require('shell');

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

    exportHtml: function(win, abrDoc, cm) {
        abrDoc.exportHtml();
    },

    close: function(win, abrDoc, cm) {
        abrDoc.close();
    },

    quit: function(win, abrDoc, cm) {
        win.close();
    },

    /* Edit */

    undo: function(win, abrDoc, cm) {
        cm.execCommand("undo");
    },

    redo: function(win, abrDoc, cm) {
        cm.execCommand("redo");
    },

    copy: function(win, abrDoc, cm) {
        document.execCommand("copy");
    },

    copyHtml: function(win, abrDoc, cm) {
        var data = cm.doc.getSelection("\n"),
            html = kramed(data),
            text = $(html).text();
        clipboard.write({
            text: text,
            html: html
        });
    },

    cut: function(win, abrDoc, cm) {
        document.execCommand("cut");
    },

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

    selectAll: function(win, abrDoc, cm) {
        cm.execCommand("selectAll");
    },

    setDictionary: function (win, abrDoc, cm, params) {
        var lang = params[0],
            path = params[1];
        abrDoc.setDictionary(lang, path);
    },

    autoCloseBrackets: function(win, abrDoc, cm) {
        var flag = cm.getOption("autoCloseBrackets");
        cm.setOption("autoCloseBrackets", !flag);
        abrDoc.setConfig("startup-commands:autoCloseBrackets", !flag);
    },

    editConfigFile: function(win, abrDoc, cm) {
        var dirPath = constants.path.userConfig;
        shell.openItem(dirPath);
    },

    /* Format */

    format: function (win, abrDoc, cm, param) {
        if (typeof param !== "undefined") {
            cm.toggle(param);
        }
    },

    /* Insert */

    draw: function (win, abrDoc, cm, param) {
        if (typeof param !== "undefined") {
            cm.draw(param);
        }
    },

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

    showMenuBar: function(win, abrDoc, cm) {
        var flag = win.isMenuBarAutoHide();
        win.setAutoHideMenuBar(!flag);
        abrDoc.setConfig("window:showMenuBar", flag);
    },

    showBlocks: function(win, abrDoc, cm) {
        $("body").toggleClass("show-blocks");
        var flag = $("body").hasClass("show-blocks");
        abrDoc.setConfig("startup-commands:showBlocks", flag);
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

    /* Debug */

    devtools: function(win, abrDoc, cm) {
        win.toggleDevTools();
    },

    reload: function(win, abrDoc, cm) {
        abrDoc.close(true);
        win.reloadIgnoringCache();
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
