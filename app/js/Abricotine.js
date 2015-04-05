module.exports = (function (window) {
    if (!window) {
        console.error ('window is not defined');
    }
    
    var commands = loadComponent('commands'),
        remote = require('remote'),
        Menu = remote.require('menu'),
        app = remote.require('app'),
        argv = remote.process.argv,
        file = loadComponent('file'),        
        BrowserWindow = remote.require('browser-window'),
        AbrDocument = loadComponent('AbrDocument');
    
    window.Abricotine = Abricotine = {
        commands: commands || {},
        exec : function (command) {
            if (Abricotine.commands && Abricotine.commands[command]) {
                Abricotine.commands[command]();
            } else {
                console.log("Unknown command '" + command + "'");
            }
        },
        // TODO: c'est verbeux, il faut juste faire un merge dans Abricotine.commands je crois. À simplifier ou supprimer.
        registerCommand: function (name, func) {
            function register (name, func) {
                Abricotine.commands[name] = func;
            }
            if (typeof name === 'object' && !func) {
                var commands = name;
                for (var commandName in commands) {
                    if (!commands.hasOwnProperty(commandName)) {
                        continue;
                    }
                    register(commandName, commands[commandName]);
                }
            } else if (typeof name === 'string' && typeof func === 'function') {
                register(name, func);
            } else {
                console.error('Bad arguments in register() function.');
            }
        }
    };
    
    // FIXME: Ce truc est merdique car asynchrone sans vra callback. Réécrire en synchrone ou avec de vrais callbacks (eg. ne pas créer de menus tant que la config n'est pas prête)
    var userConfigPath = app.getPath('userData') + "/config.json";
    if (file.existsSync(userConfigPath)) {
        file.read(userConfigPath, function (data, path) {
            Abricotine.config = JSON.parse(data);
        });
    } else {
        file.write('{}',userConfigPath);
    }
    
    // TODO: pour l'instant on ne supporte qu'un seul fichier, c'est forcément le premier argument (donc troisième de argv) et on ne test pas l'existence avant de passer au constructeur. Il faudrait améliorer tout ça.
    var fileToOpen = false;
    // FIXME: ne fonctionne pas dans tous les contextes. Il faut tester argv.
    if (argv.length > 2) {
        fileToOpen = argv[2];
    }
    Abricotine.document = new AbrDocument(fileToOpen);
    
    Abricotine.currentDocument = function () {
        return Abricotine.document;
    };
    
    // INIT STUFFS
    // TODO: je me demande si ça vaut pas le coup de séparer Abricotine (objet par défaut) de init (ci dessous)
    // Menu
    // Pour la personnalisation des raccourcis et l'i18n, on peut donner un id à chaque menu dans le json et la valeur du json est alors valeur par défaut, qui peut être écrasée par des fichiers de config.
    (function () {
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
        Menu.setApplicationMenu(menu); // TODO: Must be called within app.on('ready', function(){ ... });
        var contextMenu = createMenuFromJSON('contextMenu');
        document.addEventListener("contextmenu", function () {
            contextMenu.popup(BrowserWindow.getFocusedWindow());
        });
    })();
    window.onbeforeunload = function(e) {
        return Abricotine.currentDocument().cmdClose();
    };
})(window);