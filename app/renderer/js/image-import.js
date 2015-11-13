// Importe toutes les images.
// Deux façons d'utiliser : auto on save ou ponctuellement
var dialogs = require.main.require("./js/dialogs.js"),
    files = require.main.require("../files.js"),
    isUrl = require("is-url"),
    pathModule = require("path"),
    parsePath = require("parse-filepath"),
    salvator = require("salvator");

// Import all images
function imageImport (abrDoc, destFolder, updateEditor) {

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

    function processMatch (match, line) {
        var url = match[2],
            filename = parsePath(url).basename,
            target = pathModule.join(destFolder, filename);
        // Si l'url correspond déjà au dest folder alors continue
        if (url === target) {
            return;
        }
        // Jump to next file if already copied
        var source = getImageUrl(url);
        if (sources.indexOf(source) !== -1) {
            next();
            return;
        }
        sources.push(source);
        // Si le fichier de destination existe déjà alors on
        salvator.safe(target, { exclude: dests }).then(function(safePath) {
            target = safePath;
            dests.push(target);
            // Process next file
            next();
            // Copier l'image dans le destFolder
            files.copyFile(source, target);
            if (updateEditor !== false) {
                // Changer l'url dans l'éditeur
                var lineNumber = cm.doc.getLineNumber(line),
                    from = {
                        line: lineNumber,
                        ch: match.index + match[1].length
                    },
                    to = {
                        line: lineNumber,
                        ch: from.ch + match[2].length
                    };
                cm.doc.replaceRange(target, from, to, "*");
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
            dialogs.importImagesDone(destFolder);
        }
    }

    function main() {
        var regex = /(!\[["'-a-zA-Z0-9@:%._\+~#=\.\/! ]*\]\()([\(\)\[\]-a-zA-Z0-9@:%_\+~#=\.\/ ]+\.(?:jpg|jpeg|png|gif|svg))(?:\s(?:"|')(?:[-a-zA-Z0-9@:%_\+~#=\.\/! ]*)(?:"|')\s?)?\)/gi,
            match;
        destFolder = destFolder || parsePath(abrDoc.path).basename + "_files";
        files.createDir(destFolder);
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

    var cm = abrDoc.cm,
        queue = [],
        sources = [],
        dests = [],
        saveDocOnFinish = false;

    if (!abrDoc.path) {
        saveDocOnFinish = true;
        dialogs.askNeedSave(abrDoc, main);
    } else {
        main();
    }
}

module.exports = imageImport;
