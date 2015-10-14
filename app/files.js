// Can be called by both browser and renderer

var fs = require("fs"),
    http = require("http"),
    isUrl = require("is-url"),
    mime = require("mime"),
    parsePath = require("parse-filepath");

var files = {

    // Copier un fichier vers target
    // Callback a l'éventuelle error en paramètre
    // TODO: suffixer les images quand elles ont des homonymes
    copyFile: function (source, target, mainCallback) {
        
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
        this.createDir(target);
        if (!isUrl(source)) {
            localReadStream(source, pipeStreams);
        } else {
            remoteReadStream(source, pipeStreams);
        }
    },

    // Vérifier l'existence du dossier de destination et le créer si nécessaire
    createDir: function (target) {
        var destDir = parsePath(target).dirname;
        try {
            fs.mkdirSync(destDir);
        } catch (e) {
            if (e.code !== "EEXIST") throw e;
        }
        return destDir;
    },

    getDir: function (path) {
        path = path || this.path;
        if (!path) { return undefined; }
        return path.substring(0, path.lastIndexOf("/") + 1);
    },

    isTextFile: function (path) {
        try {
            var fileStat = fs.statSync(path); // TODO: use async function
            if (fileStat.isFile()) {
                var mimetype = mime.lookup(path);
                return (mimetype && mimetype.substr(0,4) === 'text');
            }
            return false;
        }
        catch(err) {
            console.log(err);
            return false;
        }
    },

    readFile: function (path, callback) {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                console.error(err);
                return false;
            } else if (typeof callback === 'function') {
                callback(data, path);
            }
            return true;
        });
    },

    writeFile: function (data, path, callback) {
        fs.writeFile(path, data, function (err) {
            if (err) {
                console.error(err);
                return false;
            } else if (typeof callback === 'function') {
                callback();
            }
            return true;
        });
    }
};

module.exports = files;
