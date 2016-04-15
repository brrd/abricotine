/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("remote"),
    AbrDocument = require.main.require("./abr-document.js"),
    dialogs = remote.require("./dialogs.js");

$( function () {
    var abrDoc = new AbrDocument();

    // Close event
    window.onbeforeunload = function(e) {
        if (!abrDoc.isClean()) {
            e.returnValue = false;
            dialogs.askClose(abrDoc);
        }
    };

    window.abrDoc = abrDoc;
});
