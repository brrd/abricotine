var remote = require("remote"),
    app = remote.require("app"),
    dialogs = require.main.require("./js/dialogs.js"),
    files = require.main.require("../files.js");

var templatePath = app.getAppPath() + "/app/renderer/export-template.html";

function getDocTitle (data) {
    var firstLine = /^#*(.*)$/m, // FIXME: not working (image par exemple)
        test = firstLine.exec(data),
        title = test !== null ? test[1].trim() : "Abricotine document";
    return title;
}

function exportHtml (markdown, path, callback) {
    path = path || dialogs.askSavePath();
    if (!path || markdown.trim() === "") {
        return false;
    }
    // Append extension if none
    if (path.indexOf(".") === -1) {
        path += ".html";
    }
    // Get title and html content
    var title = getDocTitle(markdown),
        content = window.marked(markdown);
    // Get template
    files.readFile(templatePath, function (template) {
        // Process templating
        var page = template.replace("$DOCUMENT_TITLE", title)
                           .replace("$DOCUMENT_CONTENT", content);
        // Write output file
        files.writeFile(page, path, callback);
    });
}

module.exports = exportHtml;
