
var mime = require('mime'),
    remote = require('remote'),
    fs = require('fs'),
    Menu = remote.require('menu'),
    BrowserWindow = remote.require('browser-window'),
    AbrDocument = loadComponent('AbrDocument'),
    Abricotine = loadComponent('Abricotine'),
    config =  loadComponent('config'),
    argv = remote.process.argv;

module.exports = function () {
    function getFileToOpen (argv) {
        function isTextFile (path) {
            try {
                var fileStat = fs.statSync(path);
                if (fileStat.isFile()) {
                    var mimetype = mime.lookup(path);
                    return (mimetype && mimetype.substr(0,4) === 'text');
                }
                return false;
            }
            catch(err) {
                console.log(err);
                return false;
            }
        }
        for (var i=0; i<argv.length; i++) {
            if (isTextFile(argv[i])) {
                return argv[i];
            }
        }
        return false;
    }
    function initUi (config) {
        // TODO: mettre ces entrées dans un parent "startup" du fichier config histoire de pas avoir a les énumérer
        if (config.autoHideMenuBar) {
            Abricotine.execCommand("autoHideMenuBar");
        }
        if (config.showBlocks) {
            Abricotine.execCommand("showBlocks");
        }
        if (config.showHiddenCharacters) {
            Abricotine.execCommand("showHiddenCharacters");
        }
        if (config.showTocPane) {
            Abricotine.execCommand("showTocPane");
        }
    }
    function initMenu (config) {
        function preprocessTemplate (element) {
            function replaceAttributes (item) {
                if (item.command) {
                    item.click = (function (command) {
                        return function () { Abricotine.execCommand(command); };
                    })(item.command);
                    delete item.command;
                }
                if (item.checked && typeof item.checked === "string") {
                    item.checked = config[item.checked] || false;
                }
                if (item.submenu) {
                    preprocessTemplate(item.submenu);
                }
                return item;
            }
            if (element.constructor !== Array) {
                return;
            }
            for (var i=0; i<element.length; i++) {
                replaceAttributes(element[i]);
            }
            return element;
        }
        function createMenuFromJSON (jsonPath) {
            var menuTemplate = loadComponent(jsonPath, 'json'),
                preprocessedMenuTemplate = preprocessTemplate(menuTemplate),
                menu = Menu.buildFromTemplate(preprocessedMenuTemplate);
            return menu;
        }
        /* Menu */
        var menu = createMenuFromJSON('menu');
        Menu.setApplicationMenu(menu);
        /* Context Menu */
        var contextMenu = createMenuFromJSON('contextMenu');
        document.addEventListener("contextmenu", function () {
            contextMenu.popup(BrowserWindow.getFocusedWindow());
        });
        /* Reference in Abricotine */
        Abricotine.menu = menu;
        Abricotine.contextMenu = contextMenu;
    }
    function initDragAndDrop () {
        document.body.ondragover = function () {
            return false;
        };
        document.body.ondragleave = document.body.ondragend = function () {
            return false;
        };
        document.body.ondrop = function (e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            if (file && file.path) {
                Abricotine.getCurrentDocument().cmdOpen(file.path);
            }
            return false;
        };
    }
    function initEvents () {
        // ToC links
        $("#pane").on("click", "li", function () {
            var line = parseInt($(this).attr('data-abricotine-gotoline')),
                cm = Abricotine.getCurrentDocument().editor.cm,
                doc = cm.doc,
                height = cm.getScrollInfo().clientHeight,
                top = cm.heightAtLine(line, "local"),
                marginTop = 10;
            doc.setCursor({
                line: line,
                ch: null
            });
            // Scoll to show target at the top of the window
            cm.scrollIntoView({
                top: top - marginTop,
                bottom: top + height - marginTop,
                left: 0,
                right: 0
            });
            cm.focus();
        });
        // Close event
        window.onbeforeunload = function(e) {
            config.saveUserConfig(Abricotine.config);
            return Abricotine.getCurrentDocument().cmdClose();
        };
    }
    if (!window) {
        console.error('window is not defined');
    }
    window.Abricotine = Abricotine;
    var fileToOpen = getFileToOpen(argv),
        fullConfig = config.getFullConfig(),
        abrDoc;
    initUi(fullConfig);
    initMenu(fullConfig);
    initDragAndDrop();
    initEvents();
    Abricotine.config = fullConfig;
    abrDoc = new AbrDocument(fileToOpen);
    Abricotine.documents.push(abrDoc);
};
