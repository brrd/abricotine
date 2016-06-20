/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("remote"),
    ipc = require("electron").ipcRenderer;

function IpcClient () {
    this.callbacks = [];
    this.windowId = remote.getCurrentWindow().id;
    var that = this,
        runCallback = function (key, value, id, windowId) {
            if (typeof id !== "undefined" && typeof that.callbacks[id] === "function" && windowId === that.windowId) {
                var callback = that.callbacks[id];
                callback(value);
            }
        };
    ipc.on("get-reply", runCallback);
    ipc.on("set-reply", runCallback);
    ipc.on("trigger-reply", runCallback);
}

IpcClient.prototype = {

    registerCallback: function (callback) {
        if (typeof callback !== "function") {
            return false;
        }
        var id = this.callbacks.length;
        this.callbacks.push(callback);
        return id;
    },

    get: function (key, callback) {
        var id = this.registerCallback(callback);
        ipc.send("get", key, id, this.windowId);
    },

    set: function (key, value, callback) {
        var id = this.registerCallback(callback);
        ipc.send("set", key, value, id, this.windowId);
    },

    trigger: function (key, args, callback) {
        var id = this.registerCallback(callback);
        ipc.send("trigger", key, args, id, this.windowId);
    },

    listenToCommands: function (callback) {
        ipc.on("command", callback);
    },
};

module.exports = IpcClient;
