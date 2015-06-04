var remote = require('remote'),
    BrowserWindow = remote.require('browser-window'),
    commands = loadComponent('commands');

module.exports = {
    version: "0.0.1", // TODO: get from package.json (or grunt)
    commands: commands || {},
    execCommand : function (command) {
        if (this.commands && this.commands[command]) {
            var currentDocument = this.getCurrentDocument(),
                browserWindow = this.browserWindow;
            this.commands[command](browserWindow, currentDocument);
        } else {
            console.log("Unknown command '" + command + "'");
        }
    },
    registerCommand: function (name, func) {
        function alreadyExists (commandName) {
            return ;
        }
        function register (name, func) {
            if (this.commands[name] !== undefined) {
                console.log("Warning: command '" + name + "' already exists. Older command has been overwritten.");
            }
            this.commands[name] = func;
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
    },
    documents: [],
    getCurrentDocument: function () {
        return Abricotine.documents[0];
    },
    browserWindow: BrowserWindow.getFocusedWindow(),
    config: {},
    menu: {},
    contextMenu: {},
    /* getMenuItem("file:open"). FIXME: Uses labels: no good for i18n */
    // TODO: use it (undo, redo, save, findNext, findPrev, clearSearch...)
    getMenuItem: function (label, menu) {
        function findMenuItem (menu) {
            if (!menu.items || !label || typeof label !== "string") {
                return false;
            }
            var items = menu.items,
                foundItem;
            label = label.trim();
            for (var i=0; i<items.length; i++) {
                if (items[i].label.trim()  === label) {
                    return items[i];
                }
                if (items[i].submenu) {
                    foundItem = findMenuItem(items[i].submenu);
                    if (foundItem) {
                        return foundItem;
                    }
                }
            }
            return false;
        }
        menu = menu || Abricotine.menu;
        return findMenuItem(menu);
    },
    isPaneVisible: function () {
        return $('body').hasClass('pane-visible');
    },
    setTocHtml: function (toc) {
        if (toc.length === 0) {
            return;
        }
        var html = "";
        for (var i=0; i<toc.length; i++) {
            html += '\n<li class="toc-h' + toc[i].level + '" data-abricotine-gotoline="' + toc[i].line + '"><a>' + toc[i].content + '</a></li>';
        }
        $('#pane ul#toc-container').html(html);
    }
};