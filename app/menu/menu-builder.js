var BrowserWindow = require ("browser-window"),
    Menu = require("menu"),
    utils = require.main.require("./utils");

function sendCommand (command, parameters, win) {
    win = utils.getWindow(win);
    win.webContents.send("command", command, parameters);
}

function preprocessTemplate (element, config) {
    if (element.constructor !== Array) {
        return;
    }
    config = typeof config !== "undefined" ? config : {};
    var replaceAttributes = function (item) {
        if (item.command) {
            item.click = (function (command, parameters) {
                return function () { sendCommand(command, parameters); };
            })(item.command, item.parameters);
            delete item.command;
            delete item.parameters;
        }
        if (item.checked && typeof item.checked === "string") {
            item.checked = config[item.checked] || false;
            // Launch commands at startup depending to config
            // TODO: activate when commands are OK
            /* if (item.checked) {
                item.click();
            } */
        }
        if (item.submenu) {
            preprocessTemplate(item.submenu, config);
        }
        return item;
    };
    for (var i=0; i<element.length; i++) {
        replaceAttributes(element[i]);
    }
    return element;
}

var menuBuilder = {
    build: function (menuTemplate, config) {
            var preprocessedMenuTemplate = preprocessTemplate(menuTemplate, config),
            menu = Menu.buildFromTemplate(preprocessedMenuTemplate);
            return menu;
    }
};

module.exports = menuBuilder;
