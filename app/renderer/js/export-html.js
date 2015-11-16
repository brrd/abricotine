var remote = require("remote"),
    app = remote.require("app"),
    dialogs = require.main.require("./js/dialogs.js"),
    files = require.main.require("../files.js"),
    kramed = require("kramed"),
    parsePath = require("parse-filepath");

function getDocTitle (data) {
    var firstLine = /^#+(.*)$/m,
        test = firstLine.exec(data),
        title = test !== null ? test[1].trim() : "Abricotine document";
    return title;
}

function exportHtml (abrDoc, templatePath, destPath, callback) {
    // Default template if undefined
    templatePath = templatePath || app.getAppPath() + "/app/templates/default";
    // Get editor content
    var markdown = abrDoc.getData();
    // Ask for destination path if undefined
    destPath = destPath || dialogs.askSavePath();
    if (!destPath || markdown.trim() === "") {
        return false;
    }
    // Append extension if none
    if (destPath.indexOf(".") === -1) {
        destPath += ".html";
    }

    // Copy images
    // TODO: should be an option
    // TODO: change img url in generated content
    // abrDoc.imageImport(destPath + "_files/images", false);

    // Markdown to HTML conversion
    var htmlContent = kramed(markdown);

    // Process and save HTML
    files.readFile(templatePath + "/template.html", function (template) {
        // Process templating
        var page = template.replace(/\$DOCUMENT_TITLE/g, getDocTitle(markdown))
                           .replace(/\$DOCUMENT_CONTENT/g, htmlContent)
                           .replace(/\$ASSETS_PATH/g, "./" + parsePath(destPath).basename + "_files");
        // Write output file
        files.writeFile(page, destPath, function (err) {
            if (err) {
                if (typeof callback === "function") {
                    callback(err, destPath);
                }
                return;
            }
            var assetsPath = templatePath + "/assets",
                destAssetsPath = destPath + "_files";
            // Copy assets and run callback if exists
            files.copyLocalDir(assetsPath, destAssetsPath, function () {
                callback(null, destPath);
            });
        });
    });
}

module.exports = exportHtml;
