/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("electron").remote,
    constants = remote.require("./constants"),
    files = remote.require("./files.js"),
    isUrl = require("is-url"),
    md2html = require.main.require("./md2html.js"),
    parsePath = require("parse-filepath"),
    pathModule = require("path");

function getDocTitle (data, defaultTitle) {
    var firstLine = /^#+(.*)$/m,
        test = firstLine.exec(data),
        title = test !== null ? test[1].trim() : defaultTitle;
    return title;
}

function exportHtml (abrDoc, templateName, destPath, options = {}, callback) {
    templateName = templateName || "default";
    // Get template path
    var templatePath = pathModule.join(constants.path.templatesDir, "/" + templateName);
    // Get editor content
    var markdown = abrDoc.getData();
    // Ask for destination path if undefined
    destPath = destPath || abrDoc.dialogs.askSavePath();
    if (!destPath || markdown.trim() === "") {
        return false;
    }
    // Append extension if none
    if (destPath.indexOf(".") === -1) {
        destPath += ".html";
    }

    // Markdown to HTML conversion
    var htmlContent = md2html(markdown);

    // Copy images
    if (options.copyImages === true) {
        var imgDirAbs = destPath + "_files/images";
        abrDoc.imageImport(imgDirAbs, { copyRemote: options.copyImagesRemote });

        // Update images src attributes
        var assetsPath = "./" + parsePath(destPath).basename + "_files";
        var re = /(<img[^>]+src=['"])([^">]+)(['"])/gmi;
        htmlContent = htmlContent.replace(re, function (str, p1, p2, p3) {
            if (options.copyImagesRemote === false && isUrl(p2)) {
              return str;
            }
            var basename = parsePath(p2).basename;
            var replacement = p1 + pathModule.join(assetsPath, "/images", basename) + p3;
            return replacement;
        });
    }

    // Process and save HTML
    files.readFile(pathModule.join(templatePath, "/template.html"), function (template) {
        // Process templating
        var defaultTitle = abrDoc.localizer.get("html-export-title"),
            docTitle = getDocTitle(markdown, defaultTitle),
            page = template.replace(/\$DOCUMENT_TITLE/g, function () { return docTitle; })
                           .replace(/\$DOCUMENT_CONTENT/g, function () { return htmlContent; })
                           .replace(/\$ASSETS_PATH/g, function () { return assetsPath; });
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
