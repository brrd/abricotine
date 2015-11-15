// Can be called by both browser and renderer
var glob = require("glob");
if (process.type === "renderer") {
    var remote = require("remote"),
        app = remote.require("app"),
        BrowserWindow = remote.require("browser-window");
    // NOTE: "./abr-window.js" is not required in renderer process
} else {
    var AbrWindow = require.main.require("./abr-window.js"),
        app = require("app"),
        BrowserWindow = require("browser-window");
}
var utils = {
    // pattern is glob pattern. Due to node require scope limitations, it must be the full path from app/.
    // options is glob options
    // cbSingle(mod, modPath) is the callback to execute after module is loaded
    // cbAll([mods]) is the callback to execute after all modules are loaded
    batchRequire: function  (pattern, cbSingle, cbAll) {
        var cwd = process.type === "browser" ? "/app/" : "/app/renderer/";
        glob(pattern, { cwd: app.getAppPath() + cwd }, function (err, files) {
            if (err !== null) {
                console.error("Glob error");
                return;
            }
            var modPath,
                promises = [],
                getAPromise = function (modPath, callback) {
                    return new Promise (function (resolve, reject) {
                        var mod = require.main.require(modPath);
                        if (typeof callback === "function") {
                            callback(mod, modPath);
                        }
                        resolve(mod);
                    });
                };
            for(var i=0; i<files.length; i++){
                modPath = "./" + files[i];
                promises.push(getAPromise(modPath, cbSingle));
            }
            Promise.all(promises).then(cbAll);
        });
    },

    getWindow: function (win) {

        if (typeof win === "number") {
            return BrowserWindow.fromId(win);
        } else if (win instanceof BrowserWindow) {
            return win;
        } else if (win && typeof win.browserWindow !== "undefined") {
            return win.browserWindow;
        } else if (typeof remote !== "undefined") {
            return remote.getCurrentWindow();
        } else {
            return BrowserWindow.getFocusedWindow();
        }
    }
};

module.exports = utils;
