var fs = require('fs'),
    remote = require('remote'),
    app = remote.require('app'),
    defaultConfig = loadComponent('defaultConfig', 'json'),
    appPath = app.getPath('userData') + '/app/',
    userConfigPath = appPath + "/user.json";

/* Create the app folder if it doesn't exist */
try {
    fs.mkdirSync(appPath);
} catch(err) {
    if ( err.code != 'EEXIST' ) throw err;
}

module.exports = {
    getUserConfig: function () {
        try {
            var data = fs.readFileSync(userConfigPath, 'utf8');
            return JSON.parse(data);
        }
        catch (err) {
            return {};
        }
    },
    getDefaultConfig: function () {
        return defaultConfig;
    },
    getFullConfig: function () {
        var userConfig = this.getUserConfig(),
            config = defaultConfig;
        $.extend(config, userConfig);
        return config;        
    },
    saveUserConfig: function (config) {
        var data = JSON.stringify(config, null, '\t');
        fs.writeFileSync(userConfigPath, data);
    }
};