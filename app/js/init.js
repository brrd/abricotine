
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
        if (config.autoHideMenuBar) {
            Abricotine.exec("autoHideMenuBar");
        }
        if (config.showBlocks) {
            Abricotine.exec("showBlocks");
        }
        if (config.showHiddenCharacters) {
            Abricotine.exec("showHiddenCharacters");
        }
    }
    function initMenu (config) {
        function preprocessTemplate (element) {
            function replaceAttributes (item) {
                if (item.command) {
                    item.click = (function (command) {
                        return function () { Abricotine.exec(command); };
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
            Abricotine.currentDocument().cmdOpen(file.path);
            return false;
        };
    }
    function initCloseEvent () {
        window.onbeforeunload = function(e) {
            config.saveUserConfig(Abricotine.config);
            return Abricotine.currentDocument().cmdClose();
        };
    }
    
    if (!window) {
        console.error('window is not defined');
    }
    window.Abricotine = Abricotine;
    var fileToOpen = getFileToOpen(argv),
        fullConfig = config.getFullConfig();
    initUi(fullConfig);
    initMenu(fullConfig);
    initDragAndDrop();
    initCloseEvent();
    Abricotine.config = fullConfig;
    Abricotine.documents.push(new AbrDocument(fileToOpen));
};