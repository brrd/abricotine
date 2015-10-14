// Importe toutes les images.
// Deux façons d'utiliser : auto on save ou ponctuellement
var files = require.main.require("../files.js"),
    isUrl = require("is-url"),
    pathModule = require("path"),
    parsePath = require("parse-filepath");

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

function processMatch (match, destFolder, cm, line) {
    var url = match[2],
        filename = parsePath(url).basename,
        target = pathModule.join(destFolder, filename);
    // Si l'url correspond déjà au dest folder alors continue
    if (url === target) {
        return;
    }
    // Copier l'image dans le destFolder
    var source = getImageUrl(url);
    files.copyFile(source, target);
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

// Import all images
function imageImport (abrDoc) {
    if (!abrDoc.path) {
        console.log("Le document  doit être enregistré avant.");
        return; // TODO: écrire une notification utilisateur, etc. voir cmdClose
    }
    // TODO: factoriser avec previewInLine.js (getImageUrl et donc module path). Attention la regex n'est pas la même. Il faudrait peut etre avoir regex.js et utils.js. Ou alors séparer encore replaceInLine avec un cb.

    var destFolder = parsePath(abrDoc.path).basename + "_files",
        regex = /(!\[["'-a-zA-Z0-9@:%._\+~#=\.\/! ]*\]\()([-a-zA-Z0-9@:%_\+~#=\.\/ ]+\.(?:jpg|jpeg|png|gif|svg))(?:\s(?:"|')(?:[-a-zA-Z0-9@:%_\+~#=\.\/! ]*)(?:"|')\s?)?\)/gi,
        match,
        cm = abrDoc.cm;
    cm.doc.eachLine( function (line) {
        while ((match = regex.exec(line.text)) !== null) {
            processMatch(match, destFolder, cm, line);
            // TODO: tell user when it's done
        }
    });
}

module.exports = imageImport;
