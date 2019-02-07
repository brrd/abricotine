/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var constants = require.main.require("./constants"),
    files  = require.main.require("./files"),
    fs = require("fs"),
    langmap = require("langmap"),
    Menu = require("electron").Menu,
    pathModule = require("path"),
    spellchecker = require('spellchecker'),
    sysDictionaries = spellchecker.getAvailableDictionaries();

function getConfig (config, key) {
    if (config && typeof config.get === "function") {
        return config.get(key) || false;
    }
    return false;
}

function preprocessTemplate (abrApp, element, config, abrWin) {
    if (element.constructor !== Array) {
        return;
    }
    var sendCommand = abrApp.execCommand.bind(abrApp),
        replaceAttributes = function (item) {
            if (item.condition) {
                    delete item.condition;
            }
            if (item.labelKey) {
                var newLabel = abrApp.localizer.get(item.labelKey);
                if (newLabel !== null) {
                    item.label = abrApp.localizer.get(item.labelKey);
                }
                delete item.labelKey;
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
            if (!item.permanent && !abrWin) {
                item.enabled = false;
                delete item.permanent;
            }
            if (item.submenu) {
                if (item.id === "spelling") {
                    item.submenu = spellingMenuGenerator(item.submenu, config);
                }
                if (item.id === "exportHtml") {
                    item.submenu = assetsMenuGenerator(item.submenu, constants.path.templatesDir, "template.json", "exportHtml");
                }
                if (item.id === "themes") {
                    var checkId = getConfig(config, "theme");
                    item.submenu = assetsMenuGenerator(item.submenu, constants.path.themesDir, "theme.json", "loadTheme", "radio", checkId);
                }
                preprocessTemplate(abrApp, item.submenu, config, abrWin);
            }
            return item;
        };
    // Process menuItem
    for (var i=0; i<element.length; i++) {
        var el = element[i],
            hiddenWithThisConfig = el.condition && !getConfig(config, el.condition),
            hiddenWithThisPlatform = el.platform && el.platform.indexOf(process.platform) === -1;
        if (hiddenWithThisConfig || hiddenWithThisPlatform) {
            // Remove elements that should not be displayed (config --debug or platform-specific menuItems)
            element.splice(i, 1);
            i--;
        } else {
            // Process attributes
            replaceAttributes(el);
        }
    }
    return element;
}

// Generate spelling menu template (before preprocesssing)
function spellingMenuGenerator (submenu, config) {
    // Get language name for its code
    function getLangName (code) {
        code = code.replace("_", "-");
        return typeof langmap[code] !== "undefined" ? langmap[code].nativeName : null;
    }
    // Get a language menuItem
    function getLangMenu (lang, path, config) {
        var label = getLangName(lang);
        if (!label) return null;
        var isConfigLang = getConfig(config, "spellchecker:active") && getConfig(config, "spellchecker:language") === lang;
        radioChecked = radioChecked || isConfigLang;
        return {
            label: label,
            type: "radio",
            checked: isConfigLang,
            command: "setDictionary",
            parameters: path ? [lang, path] : [lang]
        };
    }
    // Get hunspell dictionaries path
    // Search the dict dir in abricotine config folder
    // Returns an object { "en_US": "path/to/en_US", etc. }
    function getHunspellDictionaries () {
        var dicts = {},
            paths = [
                constants.path.dictionaries
            ],
            subdirs;
        for (var i=0; i<paths.length; i++) {
            subdirs = files.getDirectories(paths[i]);
            for (var j=0; j<subdirs.length; j++) {
                dicts[subdirs[j]] = pathModule.join(paths[i], subdirs[j]);
            }
        }
        return dicts;
    }
    var radioChecked = false,
        langMenu;
    if (sysDictionaries.length !== 0) {
        // System builtin dictionaries
        for (var i=0; i<sysDictionaries.length; i++) {
            langMenu = getLangMenu(sysDictionaries[i], null, config);
            if (langMenu) submenu.push(langMenu);
        }
    } else {
        // Hunspell dictionaries
        var hunspellDictionaries = getHunspellDictionaries();
        if (hunspellDictionaries.length !== 0) {
            for (var lang in hunspellDictionaries) {
                langMenu = getLangMenu(lang, hunspellDictionaries[lang], config);
                if (langMenu) submenu.push(langMenu);
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

// Generate menu template (before preprocesssing)
function assetsMenuGenerator (submenu, dirPath, jsonName, command, menuType, checkId) {
    // Get a menu item
    function getTemplateMenu (id) {
        var itemPath = pathModule.join(dirPath, id),
            itemInfos = (function (itemPath) {
                var jsonPath = pathModule.join(itemPath, "/", jsonName);
                try {
                    var str = fs.readFileSync(jsonPath, "utf-8"); // TODO: async
                    return JSON.parse(str);
                } catch (err) {
                    return {};
                }
            })(itemPath);
        var menuItem = {
            label: itemInfos.label || itemInfos.name || id,
            command: command,
            accelerator: itemInfos.accelerator,
            parameters: id
        };
        if (menuType === "checkbox" || menuType === "radio") {
            menuItem.type = menuType;
            menuItem.checked = (checkId && checkId === id);
        }
        return menuItem;
    }
    // Walk in dir and find items
    var subdirs = files.getDirectories(dirPath);
    for (var i in subdirs) {
        submenu.push(getTemplateMenu(subdirs[i]));
    }
    return submenu;
}

// Electron's menu wrapper
function AbrMenu (abrApp, abrWin, menuTemplate, config) {
    this.abrWin = abrWin;
    var cloneTemplate = JSON.parse(JSON.stringify(menuTemplate)); // Electron modifies the template while building the menu so we need to clone it before
    var preprocessedMenuTemplate = preprocessTemplate(abrApp, cloneTemplate, config, abrWin);
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
        // FIXME: use win.setMenu(menu) for Linux and Windows instead
        Menu.setApplicationMenu(this.menu);
    }
};

module.exports = AbrMenu;
