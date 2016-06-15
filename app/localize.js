var languages = {
    "en_US": {
        "name": "English", "messages": require.main.require("./locales/en_US.json")
    }, "fr_FR": {
        "name": "Français", "messages": require.main.require("./locales/fr_FR.json")
    }
};

var configKey = "window:language";

var localize = function (config, key) {
    if (!key.startsWith("%")) {
        return key;
    }
    key = key.substring(1, key.length);
    var currentLanguage = config.get(configKey);
    var messages = languages[currentLanguage].messages;
    var translation = messages[key];
    if (!translation) {
        console.warn("Missing key " + key + " in language " + currentLanguage);
        translation = key;
    }
    return translation;
};

module.exports.get = localize;
module.exports.availableLanguages = languages;
