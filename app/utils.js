// Can be called by both browser and renderer
var glob = require("glob");
if (process.type === "renderer") {
    var remote = require("remote"),
        BrowserWindow = remote.require("browser-window");
    // NOTE: "./abr-window.js" is not required in renderer process
} else {
    var AbrWindow = require.main.require("./abr-window.js"),
        BrowserWindow = require("browser-window");
}
var utils = {
    // pattern is glob pattern. Due to node require scope limitations, it must be the full path from app/.
    // options is glob options
    // callback(mod, modPath) is the function to launch after module is loaded
    batchRequire: function  (pattern, callback) {
        var cwd = process.type === "browser" ? "./app/" : "./app/renderer/";
        glob(pattern, { cwd: cwd }, function (err, files) {
            if (err !== null) {
                console.error("Glob error");
                return;
            }
            var mod,
                modPath;
            for(var i=0; i<files.length; i++){
                modPath = "./" + files[i];
                mod = require.main.require(modPath);
                if (typeof callback === "function") {
                    callback(mod, modPath);
                }
            }
        });
    },

    getWindow: function (win) {
        if (typeof win === "number") {
            return BrowserWindow.fromId(win);
        } else if (win instanceof BrowserWindow) {
            return win;
        } else if (process.type === "browser" && win instanceof AbrWindow) {
            return win.browserWindow;
        } else if (typeof remote !== "undefined") {
            return remote.getCurrentWindow();
        } else {
            return BrowserWindow.getFocusedWindow();
        }
    }
};

module.exports = utils;
