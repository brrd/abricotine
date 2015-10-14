var app = require("app"),
    constants = require.main.require("./constants.js"),
    defaultConfig = require.main.require("./config/default-config.json"),
    fs = require("fs");

// TODO: Nom ? Builder ? Manager ? Ou config tout court ?
// TODO: why not use https://www.npmjs.com/package/nconf ?
// TODO: mettre en place un système dynamique de conf : quand une conf est modifiée, elle est directement sauvée
var configBuilder = {
    build: function () {
        var userConfig = this.getUserConfig(),
            config = Object.assign(defaultConfig, userConfig);
        return config;
    },
    getUserConfig: function () {
        try {
            var data = fs.readFileSync(constants.userConfigPath, 'utf8');
            return JSON.parse(data);
        }
        catch (err) {
            return {};
        }
    },
    saveUserConfig: function (config) {
        var data = JSON.stringify(config, null, '\t');
        fs.writeFileSync(constants.userConfigPath, data);
    }
};

module.exports = configBuilder;
