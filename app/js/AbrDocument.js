// Permettra de gérer des tabs plus tard.

var AbrEditor = loadComponent('AbrEditor'),
    dialogs = loadComponent('dialogs'),
    fs = require('fs');

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

function AbrDocument (fileToOpen) {
    this.editor = new AbrEditor(this); // TODO: ce nom n'est pas consistant
    if (fileToOpen) {
        this.open(fileToOpen);
    } else {
        this.cmdNew();
    }
}

AbrDocument.prototype.isClean = function () {
    return this.editor.isClean();
};

AbrDocument.prototype.setClean = function () {
    this.editor.setClean();
};

AbrDocument.prototype.setPath = function (path) {
    this.path = path || '';
    this.updateWindowTitle();
};

AbrDocument.prototype.updateWindowTitle = function () {
    var appName = 'Abricotine',
        path = this.path || "New document",
        isClean = this.isClean(),
        saveSymbol = "*",
        title = path + " - " + appName;
    if (!isClean) {
        title = saveSymbol + title;
    }
    document.title = title;
};

AbrDocument.prototype.update = function (value, path) {
    value = value || '';
    path = path || '';
    this.editor.cm.doc.setValue(value);
    this.editor.cm.refresh(); // fix CM scrollbar bug
    this.setClean();
    this.setPath(path);
    this.editor.cm.doc.clearHistory();
};

AbrDocument.prototype.close = function (force) { 
    this.update();    
};

AbrDocument.prototype.cmdClose = function () {
    if (this.isClean() || dialogs.askClose(this.path)) {
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
        })(this);
    return readFile(path, callback);
};

AbrDocument.prototype.cmdOpen = function (path) {
    var isClosable = this.isClean() || dialogs.askClose(this.path);
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
                that.setClean();
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

module.exports = AbrDocument;