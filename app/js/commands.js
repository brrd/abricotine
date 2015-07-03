module.exports = (function () {
    var remote = require('remote'),
        app = remote.require('app'), // TODO: à entrer dans Abricotine
        shell = require('shell');

    return {
        new: function (win, doc) {
            doc.cmdClose();
        },
        open: function (win, doc) {
            doc.cmdOpen();
        },
        save: function (win, doc) {
            doc.cmdSave();
        },
        saveAs: function (win, doc) {
            doc.cmdSaveAs();
        },
        exportHtml: function (win, doc) {
            doc.cmdExportHtml();
        },
        quit: function (win, doc) {
            win.close();
        },
        undo: function (win, doc) {
            doc.editor.execCommand("undo");
        },
        redo: function (win, doc) {
            doc.editor.execCommand("redo");
        },
        copy: function (win, doc) {
            document.execCommand("copy");
        },
        copyHtml: function (win, doc) {
            var clipboard = require('clipboard'),
            data = doc.editor.cm.doc.getSelection("\n"),
            html = window.marked(data);
            // FIXME: Looks like clipboard.writeHtml(html) is not working properly.
            // TODO: Add this command to the menu when fixed.
            clipboard.writeHtml(html);
        },
        cut: function (win, doc) {
            document.execCommand("cut");
        },
        paste: function (win, doc) {
            document.execCommand("paste");
        },
        find: function (win, doc) {
            doc.editor.execCommand("clearSearch");
            doc.editor.execCommand("find");
        },
        findNext: function (win, doc) {
            doc.editor.execCommand("findNext");
        },
        findPrev: function (win, doc) {
            doc.editor.execCommand("findPrev");
        },
        replace: function (win, doc) {
            // FIXME: very bad UX in codemirror search & replace (it closes after the first replace)
            doc.editor.execCommand("clearSearch");
            doc.editor.execCommand("replace");
        },
        replaceAll: function (win, doc) {
            doc.editor.execCommand("clearSearch");
            doc.editor.execCommand("replaceAll");
        },
        clearSearch: function (win, doc) {
            doc.editor.execCommand("clearSearch");
        },
        selectAll: function (win, doc) {
            doc.editor.execCommand("selectAll");
        },
        editConfigFile: function (win, doc) {
            var userConfigPath = app.getPath('userData') + "/config.json";
            shell.openItem(userConfigPath);
        },
        italic: function (win, doc) {
            doc.editor.toggle("italic");
        },
        bold: function (win, doc) {
            doc.editor.toggle("bold");
        },
        strikethrough: function (win, doc) {
            doc.editor.toggle("strikethrough");
        },
        code: function (win, doc) {
            doc.editor.toggle("code");
        },
        ul: function (win, doc) { // TODO: incohérence de nommage
            doc.editor.toggle("unordered-list");
        },
        ol: function (win, doc) { // TODO: incohérence de nommage
            doc.editor.toggle("ordered-list");
        },
        todo: function (win, doc) { // TODO: incohérence de nommage
            doc.editor.toggle("todo-list");
        },
        quote: function (win, doc) {
            doc.editor.toggle("quote");
        },
        h1: function (win, doc) {
            doc.editor.toggle("h1");
        },
        h2: function (win, doc) {
            doc.editor.toggle("h2");
        },
        h3: function (win, doc) {
            doc.editor.toggle("h3");
        },
        h4: function (win, doc) {
            doc.editor.toggle("h4");
        },
        h5: function (win, doc) {
            doc.editor.toggle("h5");
        },
        h6: function (win, doc) {
            doc.editor.toggle("h6");
        },
        link: function (win, doc) {
            doc.editor.draw("link");
        },
        image: function (win, doc) {
            doc.editor.draw("image");
        },
        hr: function (win, doc) {
            doc.editor.draw("hr");
        },
        preview: function (win, doc) {
            // TODO: à ranger
            var fs = require('fs');
            var dir = app.getPath('temp') + '/abricotine',
                file = 'preview-' + Date.now() + '.html', // TODO: il faudrait plutot un nom de fichier constant (et donc le timestamp est un dir)
                path = dir + '/' + file;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            doc.cmdExportHtml(path, function () {
                shell.openExternal('file://' + path);
            });
        },
        showBlocks: function (win, doc) {
            $('body').toggleClass('show-blocks');
            Abricotine.config.showBlocks = $('body').hasClass('show-blocks');

        },
        showHiddenCharacters: function (win, doc) {
            $('body').toggleClass('show-hidden-characters');
            Abricotine.config.showHiddenCharacters = $('body').hasClass('show-hidden-characters');
        },
        autoPreviewImages: function(win, doc) {
            var flag = Abricotine.config.autoPreviewImages = !Abricotine.config.autoPreviewImages,
                editor = doc.editor;
            if (flag) {
                editor.execRoutine("imageAutoPreview");
            } else {
                editor.clearMarkers("img");
            }
        },
        autoPreviewTodo: function(win, doc) {
            var flag = Abricotine.config.autoPreviewTodo = !Abricotine.config.autoPreviewTodo,
                editor = doc.editor;
            if (flag) {
                editor.execRoutine("autoPreviewTodo");
            } else {
                editor.clearMarkers("span.checkbox");
            }
        },
        autoHideMenuBar: function (win, doc) {
            var focusedWindow = win,
                flag = focusedWindow.isMenuBarAutoHide();
            focusedWindow.setAutoHideMenuBar(!flag);
            Abricotine.config.autoHideMenuBar = !flag;
        },
        showTocPane: function (win, doc) {
            $('body').toggleClass('pane-visible');
            Abricotine.config.showTocPane = $('body').hasClass('pane-visible');
        },
        toggleFullscreen: function (win, doc) {
            var focusedWindow = win,
                flag = focusedWindow.isFullScreen();
            focusedWindow.setFullScreen(!flag);
            focusedWindow.setMenuBarVisibility(flag);
            // TODO: ESC > exit Fullscreen
        },
        devtools: function (win, doc) {
            win.toggleDevTools();
        },
        reload: function (win, doc) {
            doc.close();
            win.reloadIgnoringCache();
        },
        openConfigDir: function (win, doc) {
            var dirPath = app.getPath('userData');
            shell.openItem(dirPath);
        },
        openTempDir: function (win, doc) {
            var dirPath = app.getPath('temp') + '/abricotine';
            shell.openItem(dirPath);
        },
        openAppDir: function (win, doc) {
            var dirPath = __dirname;
            shell.openItem(dirPath);
        },
        execCommand: function (win, doc) {
            var cm = doc.editor.cm,
                html = "Command: <input type='text'/>",
                callback = function (query) {
                    if (!query) return;
                    Abricotine.execCommand(query);
                };
            cm.openDialog(html, callback);
        },
        tableCreate: function (win, doc, parameters) {
            if (typeof parameters === "undefined") {
                doc.editor.tableCreate();
            } else {
                doc.editor.tableCreate.apply(doc.editor, parameters);
            }
        },
        tableBeautify: function (win, doc) {
            doc.editor.tableDo("beautify");
        },
        tableAlignLeft: function (win, doc) {
            doc.editor.tableDo("align", null, "left");
        },
        tableAlignCenter: function (win, doc) {
            doc.editor.tableDo("align", null, "center");
        },
        tableAlignRight: function (win, doc) {
            doc.editor.tableDo("align", null, "right");
        },
        tableAlignClear: function (win, doc) {
            doc.editor.tableDo("align", null, null);
        },
        tableAddRowBefore: function (win, doc, parameters) {
            doc.editor.tableDo("addRowsBeforeCursor");
        },
        tableAddRowAfter: function (win, doc, parameters) {
            doc.editor.tableDo("addRowsAfterCursor");
        },
        tableAddColBefore: function (win, doc, parameters) {
            doc.editor.tableDo("addColsBeforeCursor");
        },
        tableAddColAfter: function (win, doc, parameters) {
            doc.editor.tableDo("addColsAfterCursor");
        }
    };
})();
