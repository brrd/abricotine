
var mime = require('mime');
var remote = require('remote'),
    fs = require('fs'),
    Menu = remote.require('menu'),
    BrowserWindow = remote.require('browser-window'),
    AbrDocument = loadComponent('AbrDocument'),
    Abricotine = loadComponent('Abricotine'),
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
        for (var i=0; i<=argv.length; i++) {
            if (isTextFile(argv[i])) {
                return argv[i];
            }
        }
        return false;
    }
    function initMenu () {
        function preprocessTemplate (element) {
            function replaceAttributes (item) {
                if (item.command) {
                    item.click = (function (command) {
                        return function () { Abricotine.exec(command); };
                    })(item.command);
                    delete item.command;
                } else if (item.submenu) {
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
        var menu = createMenuFromJSON('menu');
        Menu.setApplicationMenu(menu);
        var contextMenu = createMenuFromJSON('contextMenu');
        document.addEventListener("contextmenu", function () {
            contextMenu.popup(BrowserWindow.getFocusedWindow());
        });
    }
    
    if (!window) {
        console.error('window is not defined');
    }
    var fileToOpen = getFileToOpen(argv);
    window.Abricotine = Abricotine;
    initMenu();
    Abricotine.documents.push(new AbrDocument(fileToOpen));
    
    window.onbeforeunload = function(e) {
        return Abricotine.currentDocument().cmdClose();
    };
};