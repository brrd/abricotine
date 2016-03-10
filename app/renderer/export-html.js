/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("remote"),
    constants = remote.require("./constants"),
    dialogs = require.main.require("./dialogs.js"),
    files = remote.require("./files.js"),
    md2html = require.main.require("./md2html.js"),
    parsePath = require("parse-filepath"),
    pathModule = require("path");

function getDocTitle (data) {
    var firstLine = /^#+(.*)$/m,
        test = firstLine.exec(data),
        title = test !== null ? test[1].trim() : "Abricotine document";
    return title;
}

function exportHtml (abrDoc, templateName, destPath, callback) {
    templateName = templateName || "default";
    // Get template path
    var templatePath = pathModule.join(constants.path.templatesDir, "/" + templateName);
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
    var htmlContent = md2html(markdown);
    // Process and save HTML
    files.readFile(pathModule.join(templatePath, "/template.html"), function (template) {
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
            var assetsPath = pathModule.join(templatePath, "/assets"),
                destAssetsPath = destPath + "_files";
            // Copy assets and run callback if exists
            files.copyLocalDir(assetsPath, destAssetsPath, function () {
                callback(null, destPath);
            });
        });
    });
}

module.exports = exportHtml;
