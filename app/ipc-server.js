/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var ipc = require("ipc");

function IpcServer (abrApp) {
    this.abrApp = abrApp;

    // Set
    ipc.on("get", function(event, key, id, windowId) {
        event.sender.send('get-reply', key, abrApp[key], id, windowId);
    });

    // Get
    ipc.on("set", function(event, key, value, id, windowId) {
        abrApp[key] = value;
        event.sender.send('set-reply', key, value, id, windowId);
    });

    /*
        Trigger an abrApp method.
        This method firts parameter 'args' is the arguments object sent by ipc-client.
        The second parameter is an optionnal callback that can be added at the end of the method to send back a 'res' variable to ipc-client.
    */
    ipc.on("trigger", function(event, key, args, id, windowId) {
        if (typeof abrApp[key] !== "function") {
            console.error(key + " is not a valid abrApp method");
        } else {
            abrApp[key](args, windowId, function (res) {
                event.sender.send('trigger-reply', key, res, id, windowId);
            });
        }
    });
}

module.exports = IpcServer;
