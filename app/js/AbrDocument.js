// Permettra de gérer des tabs plus tard.

var AbrEditor = loadComponent('AbrEditor'),
    dialogs = loadComponent('dialogs'),
    fs = require('fs'),
    isUrl = require("is-url"),
    path = require("path"),
    parsePath = require("parse-filepath"),
    http = require("http");

// TODO: dans utils
function writeFile (data, path, callback) {
    fs.writeFile(path, data, function (err) {
        if (err) {
            return console.error(err);
        } else if (typeof callback === 'function') {
            callback();
        }
    });
}

function readFile (path, callback) {
    fs.readFile(path, 'utf8', function (err,data) {
        if (err) {
            return console.error(err);
        } else if (typeof callback === 'function') {
            callback(data, path);
        }
    });
}

// Copier un fichier vers target
// Callback a l'éventuelle error en paramètre
function copyFile(source, target, mainCallback) {
    // TODO: suffixer les images quand elles ont des homonymes

    // Vérifier l'existence du dossier de destination et le créer si nécessaire
    function setDestDir (target) {
        // Create dest dir if doesnt exist
        var destDir = parsePath(target).dirname;
        try {
            fs.mkdirSync(destDir);
        } catch (e) {
            if (e.code !== "EEXIST") throw e;
        }
    }

    // Executer callback avec readstream en parametre sauf si erreur de lecture
    function localReadStream (source, callback) {
        // Test if file exists and is readable
        fs.access(source, fs.F_OK | fs.R_OK, function (err) {
            if (!err) {
                var readStream = fs.createReadStream(source);
                readStream.on("error", function (err) {
                    mainCallback(err);
                });
                callback(readStream);
            } else {
                callback(null);
            }
        });
    }

    // Idem en ligne
    function remoteReadStream (source, callback) {
        var request = http.get(source, function(response) {
            if (response.statusCode === 200) {
                callback(response);
            } else {
                mainCallback(false);
            }
        }).on('error', function(err) {
            fs.unlink(target);
            mainCallback(err);
        });
    }

    function pipeStreams (readStream) {
        if (readStream === null) {
            mainCallback(null);
            return;
        }
        var writeStream = fs.createWriteStream(target);
        readStream.pipe(writeStream);
        writeStream.on('finish', function() {
            writeStream.close(mainCallback);
        });
    }

    mainCallback = typeof mainCallback === "function" ? mainCallback : function () { return; };
    setDestDir(target);
    if (!isUrl(source)) {
        localReadStream(source, pipeStreams);
    } else {
        remoteReadStream(source, pipeStreams);
    }
}

function AbrDocument (fileToOpen) {
    this.editor = new AbrEditor(this); // TODO: ce nom n'est pas consistant
    if (fileToOpen) {
        this.open(fileToOpen);
    } else {
        this.cmdNew();
    }
}

AbrDocument.prototype.setPath = function (path) {
    this.path = path || ''; // TODO: may store the parsed path in here for better perfs
    if (this.path) {
        var dir = parsePath(this.path).dirname;
        process.chdir(dir);
    }
};

AbrDocument.prototype.updateWindowTitle = function () {
    var appName = "Abricotine",
        isClean = this.editor.isClean(),
        saveSymbol = "*",
        parsedPath,
        title;
    if (this.path) {
        parsedPath = parsePath(this.path);
        title = parsedPath.basename + " - " + parsedPath.dirname + " - " + appName;
    } else {
        title = "New document - " + appName;
    }
    if (!isClean) {
        title = saveSymbol + title;
    }
    document.title = title;
};

AbrDocument.prototype.update = function (value, path) {
    value = value || '';
    path = path || '';
    this.setPath(path); // Must be done before everything else because it sets process.chdir
    this.editor.cm.doc.setValue(value);
    this.editor.cm.doc.clearHistory();
    this.editor.setClean();
    this.updateWindowTitle();
    this.editor.cm.refresh(); // fix CM scrollbar bug
};

AbrDocument.prototype.close = function () {
    this.update();
};

AbrDocument.prototype.cmdClose = function () {
    if (this.editor.isClean() || dialogs.askClose(this.path)) {
        this.close();
        return true;
    } else {
        return false;
    }
};

AbrDocument.prototype.cmdNew = function () {
    this.close();
};

AbrDocument.prototype.open = function (path) {
    var callback = (function (that) {
            return function (data, path) {
                that.update(data, path);
            };
        })(this),
        absolutePath = parsePath(path).absolute;
    return readFile(absolutePath, callback);
};

AbrDocument.prototype.cmdOpen = function (path) {
    var isClosable = this.editor.isClean() || dialogs.askClose(this.path);
    if (!isClosable) {
        return false;
    }
    path = path || dialogs.askOpenPath();
    if (!path) {
        return false;
    }
    this.close();
    return this.open(path);
};

AbrDocument.prototype.save = function (path, data) {
    path = path || this.path;
    data = data || this.editor.getData();
    var callback = (function (that, path) {
            return function () {
                that.editor.setClean();
                that.setPath(path);
                that.updateWindowTitle();
            };
        })(this, path);
    return writeFile(data, path, callback);
};

AbrDocument.prototype.cmdSave = function () {
    if (!this.path) {
        return this.cmdSaveAs();
    }
    return this.save();
};

AbrDocument.prototype.cmdSaveAs = function () {
    var path = dialogs.askSavePath();
    if (!path) {
        return false;
    }
    return this.save(path);
};

// TODO: obsolete. Please remove
AbrDocument.prototype.getDir = function (path) {
    path = path || this.path;
    if (!path) { return undefined; }
    return path.substring(0, path.lastIndexOf("/") + 1);
};

// TODO: Tout un travail : ces fonctions sont à rendre génériques, utiliser des templates, voire même factoriser avec .save()
AbrDocument.prototype.cmdExportHtml = function (path, callback) { // NOTE: path et callback sont utilisés pour la command 'preview'
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
    var data = this.editor.getData(),
        pageContent = getHtmlPageContent(data);
    return writeFile(pageContent, path, callback);
};

AbrDocument.prototype.openImage = function () {
    var path = dialogs.askOpenImage();
    if (!path) {
        return false;
    }
    this.editor.draw("image", path);
};

// Importe toutes les images.
// Deux façons d'utiliser : auto on save ou ponctuellement. Dans tous les cas il faudra calculer
AbrDocument.prototype.imagesImportAll = function (destFolder) {
    if (!destFolder) {
        return;
    }
    // TODO: factoriser avec previewInLine.js (getImageUrl et donc module path). Attention la regex n'est pas la même. Il faudrait peut etre avoir regex.js et utils.js. Ou alors séparer encore replaceInLine avec un cb.
    function getImageUrl (href) {
        if (isUrl(href)) {
            return href;
        }
        var parsedPath = parsePath(href);
        if (parsedPath.isAbsolute) {
            return parsedPath.absolute;
        } else {
            return path.join(process.cwd(), href);
        }
    }
    function processMatch (match, destFolder, cm, line) {
        var url = match[2],
            filename = parsePath(url).basename,
            target = path.join(destFolder, filename);
        // Si l'url correspond déjà au dest folder alors continue
        if (url === target) {
            return;
        }
        // Copier l'image dans le destFolder
        var source = getImageUrl(url);
        copyFile(source, target);
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
    var regex = /(!\[["'-a-zA-Z0-9@:%._\+~#=\.\/! ]*\]\()([-a-zA-Z0-9@:%_\+~#=\.\/ ]+\.(?:jpg|jpeg|png|gif|svg))(?:\s(?:"|')(?:[-a-zA-Z0-9@:%_\+~#=\.\/! ]*)(?:"|')\s?)?\)/gi,
    match,
    cm = this.editor.cm;
    cm.doc.eachLine( function (line) {
        while ((match = regex.exec(line.text)) !== null) {
            processMatch(match, destFolder, cm, line);
            // TODO: tell user when it's done
        }
    });
};

// TODO: ajouter une config pour faire ça automatiquement on save
AbrDocument.prototype.cmdImagesImportAll = function () {
    if (!this.path) {
        console.log("Le doc doit être enregistré avant.");
        return; // TODO: écrire une notification utilisateur, etc. voir cmdClose
    }
    var filename = parsePath(this.path).basename;
    this.imagesImportAll(filename + "_files");
};

module.exports = AbrDocument;
