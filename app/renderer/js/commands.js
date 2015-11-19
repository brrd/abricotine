var remote = require("remote"),
    app = remote.require('app'),
    clipboard = require('clipboard'),
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
        // TODO: see new electron menuItem API for native operations
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
        // TODO: see new electron menuItem API for native operations
        document.execCommand("cut");
    },

    paste: function(win, abrDoc, cm) {
        // TODO: see new electron menuItem API for native operations
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
        // TODO: utiliser des constantes
        var dirPath = app.getPath("userData") + '/app/config.json';
        shell.openItem(dirPath);
    },

    /* Format */

    italic: function(win, abrDoc, cm) {
        cm.toggle("italic");
    },

    bold: function(win, abrDoc, cm) {
        cm.toggle("bold");
    },

    strikethrough: function(win, abrDoc, cm) {
        cm.toggle("strikethrough");
    },

    code: function(win, abrDoc, cm) {
        cm.toggle("code");
    },

    ul: function(win, abrDoc, cm) { // TODO: incohérence de nommage
        cm.toggle("unordered-list");
    },

    ol: function(win, abrDoc, cm) { // TODO: incohérence de nommage
        cm.toggle("ordered-list");
    },

    todo: function(win, abrDoc, cm) { // TODO: incohérence de nommage
        cm.toggle("todo-list");
    },

    quote: function(win, abrDoc, cm) {
        cm.toggle("quote");
    },

    h1: function(win, abrDoc, cm) {
        cm.toggle("h1");
    },

    h2: function(win, abrDoc, cm) {
        cm.toggle("h2");
    },

    h3: function(win, abrDoc, cm) {
        cm.toggle("h3");
    },

    h4: function(win, abrDoc, cm) {
        cm.toggle("h4");
    },

    h5: function(win, abrDoc, cm) {
        cm.toggle("h5");
    },

    h6: function(win, abrDoc, cm) {
        cm.toggle("h6");
    },

    /* Insert */

    link: function(win, abrDoc, cm) {
        cm.draw("link");
    },

    imageFromUrl: function(win, abrDoc, cm) {
        cm.draw("image");
    },

    imageFromComputer: function(win, abrDoc, cm) {
        abrDoc.insertImage();
    },

    imagesImportAll: function(win, abrDoc, cm) {
        abrDoc.imageImport();
    },

    drawMath: function(win, abrDoc, cm) {
        cm.draw("math");
    },

    hr: function(win, abrDoc, cm) {
        cm.draw("hr");
    },

    codeblock: function (win, abrDoc, cm) {
        cm.draw("codeblock");
    },

    anchor: function (win, abrDoc, cm) {
        cm.draw("anchor");
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

    togglePreview: function(win, abrDoc, cm, param) {
        abrDoc.togglePreview(param);
    },

    togglePreviewSecurity: function (win, abrDoc, cm, param) {
        abrDoc.togglePreviewSecurity(param);
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
        // TODO: utiliser des constantes
        var dirPath = app.getPath('userData');
        shell.openItem(dirPath);
    },

    openTempDir: function(win, abrDoc, cm) {
        // TODO: utiliser des constantes
        var dirPath = app.getPath('temp') + '/Abricotine';
        shell.openItem(dirPath);
    },

    openAppDir: function(win, abrDoc, cm) {
        // TODO: utiliser des constantes
        var dirPath = __dirname;
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
    }
};

module.exports = commands;
