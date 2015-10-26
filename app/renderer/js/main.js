var remote = require("remote"),
    AbrDocument = require.main.require("./js/abr-document.js"),
    dialogs = require.main.require("./js/dialogs.js");

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
