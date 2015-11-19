var AbrDocument = require.main.require("./abr-document.js"),
    dialogs = require.main.require("./dialogs.js");

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
