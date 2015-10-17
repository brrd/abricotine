var remote = require("remote"),
    AbrDocument = require.main.require("./js/abr-document.js"),
    dialogs = require.main.require("./js/dialogs.js");

$( function () {
    var abrDoc = new AbrDocument();

    // Drag'n'drop events
    // FIXME: bug de la double insertion
    // TODO: distinguer: si drag d'une image dans l'éditor alors il faut insérer cette image
    document.body.ondragover = function () {
        return false;
    };
    document.body.ondragleave = document.body.ondragend = function () {
        return false;
    };
    document.body.ondrop = function (e) {
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        if (file && file.path) {
            // TODO: terminer
            // Abricotine.getCurrentDocument().cmdOpen(file.path);
        }
        return false;
    };

    // Close event
    window.onbeforeunload = function(e) {
        if (!abrDoc.isClean()) {
            e.returnValue = false;
            dialogs.askClose(abrDoc);
        }
    };

    window.abrDoc = abrDoc;
});
