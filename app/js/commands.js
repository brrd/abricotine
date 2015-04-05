/*
    TODO: harmoniser les commandes en .execCommand() puisque c'est le standard :
        * AbrDocument.execCommand()
        * toggle() et draw() doivent être convertis en commandes execCommand()
*/
module.exports = (function () {
    var remote = require('remote'),
        BrowserWindow = remote.require('browser-window'),
        app = remote.require('app'),
        shell = require('shell');
    
    return {
        new: function () {
            Abricotine.currentDocument().cmdClose();
        },
        open: function () {
            Abricotine.currentDocument().cmdOpen();
        },
        save: function () {
            Abricotine.currentDocument().cmdSave();
        },
        saveAs: function () {
            Abricotine.currentDocument().cmdSaveAs();
        },
        exportHtml: function () {
            Abricotine.currentDocument().cmdExportHtml();
        },
        quit: function () {
            BrowserWindow.getFocusedWindow().close();
        },
        undo: function () {
            Abricotine.currentDocument().editor.execCommand("undo");
        },
        redo: function () {
            Abricotine.currentDocument().editor.execCommand("redo");
        },
        copy: function () {
            document.execCommand("copy");
        },
        cut: function () {
            document.execCommand("cut");
        },
        paste: function () {
            document.execCommand("paste");
        },
        selectAll: function () {
            Abricotine.currentDocument().editor.execCommand("selectAll");
        },
        editConfigFile: function () {
            var userConfigPath = app.getPath('userData') + "/config.json";
            shell.openItem(userConfigPath);
        },
        italic: function () {
            Abricotine.currentDocument().editor.toggle("italic");
        },
        bold: function () {
            Abricotine.currentDocument().editor.toggle("bold");
        },
        ul: function () { // TODO: incohérence de nommage
            Abricotine.currentDocument().editor.toggle("unordered-list");
        },
        ol: function () { // TODO: incohérence de nommage
            Abricotine.currentDocument().editor.toggle("ordered-list");
        },
        quote: function () {
            Abricotine.currentDocument().editor.toggle("quote");
        },
        h1: function () {
            Abricotine.currentDocument().editor.toggle("h1");
        },
        h2: function () {
            Abricotine.currentDocument().editor.toggle("h2");
        },
        h3: function () {
            Abricotine.currentDocument().editor.toggle("h3");
        },
        h4: function () {
            Abricotine.currentDocument().editor.toggle("h4");
        },
        h5: function () {
            Abricotine.currentDocument().editor.toggle("h5");
        },
        h6: function () {
            Abricotine.currentDocument().editor.toggle("h6");
        },
        link: function () {
            Abricotine.currentDocument().editor.draw("link");
        },
        image: function () {
            Abricotine.currentDocument().editor.draw("image");
        },
        hr: function () {
            Abricotine.currentDocument().editor.draw("hr");
        },
        preview: function () {
            // TODO: à ranger
            var fs = require('fs');
            var dir = app.getPath('temp') + '/abricotine',
                file = 'preview-' + Date.now() + '.html', // TODO: il faudrait plutot un nom de fichier constant (et donc le timestamp est un dir)
                path = dir + '/' + file;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            Abricotine.currentDocument().cmdExportHtml(path, function () {
                shell.openExternal('file://' + path);
            });
        },
        showBlocks: function () {
            $('body').toggleClass('show-blocks');
            Abricotine.config.showBlocks = $('body').hasClass('show-blocks');
            
        },
        showHiddenCharacters: function () {
            $('body').toggleClass('show-hidden-characters');
            Abricotine.config.showHiddenCharacters = $('body').hasClass('show-hidden-characters');
        },
        autoHideMenuBar: function () {
            var focusedWindow = BrowserWindow.getFocusedWindow(),
                flag = focusedWindow.isMenuBarAutoHide();
            focusedWindow.setAutoHideMenuBar(!flag);
            Abricotine.config.autoHideMenuBar = !flag;
        },
        toggleFullscreen: function () {
            var focusedWindow = BrowserWindow.getFocusedWindow(),
                flag = focusedWindow.isFullScreen();
            focusedWindow.setFullScreen(!flag);
            focusedWindow.setMenuBarVisibility(flag);
            // TODO: ESC > exit Fullscreen
        },
        focusMode: function () {
            $('body').toggleClass('focus-mode');
        },
        devtools: function () {
            BrowserWindow.getFocusedWindow().toggleDevTools();
        },
        reload: function () {
            Abricotine.currentDocument().close();
            BrowserWindow.getFocusedWindow().reloadIgnoringCache();
        },
        openConfigDir: function () {
            var dirPath = app.getPath('userData');
            shell.openItem(dirPath);
        },
        openTempDir: function () {
            var dirPath = app.getPath('temp') + '/abricotine';
            shell.openItem(dirPath);
        },
        openAppDir: function () {
            var dirPath = __dirname;
            shell.openItem(dirPath);
        },
    };
})();