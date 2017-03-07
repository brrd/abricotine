/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var constants = require.main.require("./constants.js"),
    defaultConfig = require.main.require("../default/config.json"),
    nconf = require('nconf');

// Config creation
// Each AbrWindow has its own config (because different settings are possible)
// AbrApplication also has a config, which is used when loading app and when no window (OSX)
function createConfig () {
    var config = new nconf.Provider(); // https://github.com/indexzero/nconf/issues/39
    config.overrides({
            "debug": process.argv.indexOf("--debug") !== -1
        })
        .file(constants.path.userConfig)
        .defaults(defaultConfig);
    return config;
}

module.exports = createConfig;
