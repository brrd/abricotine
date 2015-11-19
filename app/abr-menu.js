var BrowserWindow = require("browser-window"),
    constants = require.main.require("./constants"),
    files  = require.main.require("./files"),
    langmap = require("langmap"),
    Menu = require("menu"),
    spellchecker = require('spellchecker');

function getConfig (config, key) {
    if (config && typeof config.get === "function") {
        return config.get(key) || false;
    }
    return false;
}

function preprocessTemplate (element, config) {
    if (element.constructor !== Array) {
        return;
    }
    var sendCommand = function (command, parameters) {
            // sendCommand detects the focused window in order to avoid problems due to window destruction
            var win = BrowserWindow.getFocusedWindow();
            win.webContents.send("command", command, parameters);
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
                item.checked = getConfig(config, item.checked);
            }
            if (item.submenu) {
                if (item.id === "spelling") {
                    item.submenu = spellingMenuGenerator(item.submenu, config);
                }
                preprocessTemplate(item.submenu, config);
            }
            return item;
        };
    for (var i=0; i<element.length; i++) {
        // Conditionnal menuItem (debug menu) : do not process if not allowed
        if (element[i].condition && !getConfig(config, element[i].condition)) {
            element.splice(i, 1);
        }
        // Replace attributes of menu items
        replaceAttributes(element[i]);
    }
    return element;
}

// Generate spelling menu template (before preprocesssing)
function spellingMenuGenerator (submenu, config) {
    // Get language name for its code
    function getLangName (code) {
        code = code.replace("_", "-");
        return typeof langmap[code] !== "undefined" ? langmap[code].nativeName : code;
    }
    // Get a language menuItem
    function getLangMenu (lang, path, config) {
        var isConfigLang = getConfig(config, "spellchecker:active") && getConfig(config, "spellchecker:language") === lang;
        radioChecked = radioChecked || isConfigLang;
        return {
            label: getLangName(lang),
            type: "radio",
            checked: isConfigLang,
            command: "setDictionary",
            parameters: path ? [lang, path] : [lang]
        };
    }
    // Get hunspell dictionaries path
    // Search 1) the abricotine builtin hunspell dict, 2) then the dict dir in abricotine config folder
    // Returns an object { "en_US": "path/to/en_US", etc. }
    function getHunspellDictionaries () {
        var dicts = {},
            paths = [
                __dirname + "/dict/",
                constants.path.userData + "/dict/"
            ],
            subdirs;
        for (var i=0; i<paths.length; i++) {
            subdirs = files.getDirectories(paths[i]);
            for (var j=0; j<subdirs.length; j++) {
                dicts[subdirs[j]] = paths[i] + subdirs[j];
            }
        }
        return dicts;
    }
    var sysDictionaries = spellchecker.getAvailableDictionaries(),
        radioChecked = false;
    if (sysDictionaries.length !== 0) {
        // System builtin dictionaries
        for (var i=0; i<sysDictionaries; i++) {
            submenu.push(getLangMenu(sysDictionaries[i], null, config));
        }
    } else {
        // Hunspell dictionaries
        var hunspellDictionaries = getHunspellDictionaries();
        if (hunspellDictionaries.length !== 0) {
            for (var lang in hunspellDictionaries) {
                submenu.push(getLangMenu(lang, hunspellDictionaries[lang], config));
                if (getConfig(config, "spellchecker:language") === lang) {
                    config.set("spellchecker:src", hunspellDictionaries[lang]); // This src config key is used for init the spellchecker in abrDoc (renderer)
                }
            }
        }
    }
    // Check the "Disabled" menu if no radio has been checked
    submenu[0].checked = !radioChecked;
    return submenu;
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
