/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("electron").remote,
    files = remote.require("./files.js"),
    isUrl = require("is-url"),
    pathModule = require("path"),
    parsePath = require("parse-filepath"),
    salvator = require("salvator");

// Import all images
function imageImport (abrDoc, destFolder, { updateEditor = false, showDialog = false } = {}) {

    function getImageUrl (href) {
        if (isUrl(href)) {
            return href;
        }
        var parsedPath = parsePath(href);
        if (parsedPath.isAbsolute) {
            return parsedPath.absolute;
        } else {
            return pathModule.join(process.cwd(), href);
        }
    }

    function getAbsPath (filepath) {
      if (parsePath(filepath).isAbsolute) return filepath;
      var dirpath = parsePath(abrDoc.path).dirname;
      return pathModule.join(dirpath, filepath);
    }

    function processMatch (match, line) {
        var url = match[2],
            filename = parsePath(url).basename,
            target = pathModule.join(destFolder, filename),
            absTarget = pathModule.join(absDestFolder, filename);
        // Skip if URL is already equals to dest folder
        if (url === target || url === absTarget) {
            return;
        }
        // Jump to next file if already copied
        var source = getImageUrl(url);
        if (sources.indexOf(source) !== -1) {
            next();
            return;
        }
        sources.push(source);
        // Use a safe path if destination file already exist
        salvator.safe(absTarget, { exclude: dests }).then(function(safePath) {
            absTarget = safePath;
            dests.push(absTarget);
            // Process next file
            next();
            // Copy image to destFolder
            files.copyFile(source, absTarget);
            if (updateEditor !== false) {
                // Change URL in editor
                var lineNumber = cm.doc.getLineNumber(line),
                    from = {
                        line: lineNumber,
                        ch: match.index + match[1].length
                    },
                    to = {
                        line: lineNumber,
                        ch: from.ch + match[2].length
                    };
                var relTarget = pathModule.relative(absDestFolder, absTarget);
                cm.doc.replaceRange(relTarget, from, to, "*");
            }
        });
    }

    function next() {
        if (queue && queue.length > 0) {
            var exec = queue.splice(0, 1);
            processMatch(exec[0].match, exec[0].line);
        } else {
            if (saveDocOnFinish) {
                abrDoc.save();
            }
            if (showDialog !== false) {
              abrDoc.dialogs.importImagesDone(destFolder);
            }
        }
    }

    function start() {
        var regex = /(!\[[^\]]*\]\()([\(\)\[\]-a-zA-Z0-9@:%_\+~#=\.\\\/ ]+\.(?:jpg|jpeg|png|gif|svg))(?:\s(?:"|')(?:[-a-zA-Z0-9@:%_\+~#=\.\/! ]*)(?:"|')\s?)?\)/gi,
            match;
        // Each line
        cm.doc.eachLine( function (line) {
            // Each image in the current line
            while ((match = regex.exec(line.text)) !== null) {
                queue.push({
                    match: match,
                    line: line
                });
            }
        });
        next();
    }

    function main() {
        if (files.dirExists(absDestFolder)) {
            return files.rm(absDestFolder + "/*", start);
        }
        files.createDir(absDestFolder);
        start();
    }

    var cm = abrDoc.cm,
        queue = [],
        sources = [],
        dests = [];

    if (!destFolder && !abrDoc.path) {
      throw Error("Error while importing images: destination folder is not a valid path.");
    }

    destFolder = destFolder || parsePath(abrDoc.path).basename + "_files";

    var saveDocOnFinish = destFolder ? false : true,
        absDestFolder = getAbsPath(destFolder);

    if (destFolder) {
        main();
    } else {
        abrDoc.dialogs.askNeedSave(abrDoc, main);
    }
}

module.exports = imageImport;
