var Menu = require("menu"),
    utils = require.main.require("./utils");

function preprocessTemplate (element, config) {
    if (element.constructor !== Array) {
        return;
    }
    var sendCommand = function (command, parameters) {
            // sendCommand detects the "best window that actually exists" in order to avoid problems due to window destruction
            var win = utils.getWindow();
            win.webContents.send("command", command, parameters);
        },
        getConfig = function (key) {
            if (config && typeof config.get === "function") {
                return config.get(key) || false;
            }
            return false;
        },
        replaceAttributes = function (item) {
            if (item.condition) {
                    delete item.condition;
            }
            if (item.command) {
                item.click = (function (command, parameters) {
                    return function () { sendCommand(command, parameters); };
                })(item.command, item.parameters);
                item.id = item.command;
                delete item.command;
                delete item.parameters;
            }
            if (item.type === "checkbox" && typeof item.checked === "string") {
                item.checked = getConfig(item.checked);
            }
            if (item.submenu) {
                preprocessTemplate(item.submenu, config);
            }
            return item;
        };
    for (var i=0; i<element.length; i++) {
        // Conditionnal menuItem (debug menu) : do not process if not allowed
        // FIXME: Attention, electron a ajouté des raccourcis par défaut pour ces fonctions
        if (element[i].condition && !getConfig(element[i].condition)) {
            element.splice(i, 1);
        }
        // Replace attributes of menu items
        replaceAttributes(element[i]);
    }
    return element;
}

// Electron's menu wrapper
function AbrMenu (abrWin, menuTemplate, config) {
    this.abrWin = abrWin;
    var preprocessedMenuTemplate = preprocessTemplate(menuTemplate, config);
    this.menu = Menu.buildFromTemplate(preprocessedMenuTemplate);
}

AbrMenu.prototype = {

    findItem: function (id) {
        function doFindItem (menu, id) {
            var items = menu.items,
                menuItem;
            for (var i=0; i <items.length; i++) {
                if (items[i].submenu) {
                    menuItem = doFindItem(items[i].submenu, id);
                } else {
                    menuItem = items[i].id === id ? items[i] : undefined;
                }
                if (menuItem) {
                    return menuItem;
                }
            }
        }
        return doFindItem(this, id);
    },

    popup: function () {
        var win = this.abrWin.browserWindow;
        this.menu.popup(win);
    },

    attach: function () {
        Menu.setApplicationMenu(this.menu);
    }
};

module.exports = AbrMenu;
