// TODO: Tout un travail : ces fonctions sont à rendre génériques, utiliser des templates, voire même factoriser avec .save()

var dialogs = require.main.require("./js/dialogs.js"),
    files = require.main.require("../files.js");

function exportHtml (abrDoc, path, callback) { // NOTE: path et callback sont utilisés pour la command 'preview'
    function getHtmlPageContent (data) {
        var firstLine = /^#*(.*)$/m, // FIXME: not working (image par exemple)
            test = firstLine.exec(data),
            title = test !== null ? test[1].trim() : "Abricotine document";
        return "<!doctype html>\n <html>\n <head>\n <title>" +
            title +
            "</title>\n <meta charset='utf-8'/>\n </head>\n <body>\n" +
            window.marked(data) +
            "\n</body>\n</html>";
    }
    path = path || dialogs.askSavePath();
    if (!path) {
        return false;
    }
    var data = abrDoc.getData(),
        pageContent = getHtmlPageContent(data);
    return files.writeFile(pageContent, path, callback);
}

module.exports = exportHtml;
