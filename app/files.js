/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var fs = require("fs"),
    isUrl = require("is-url"),
    mime = require("mime"),
    mkdirp = require('mkdirp'),
    ncp = require("ncp"),
    parsePath = require("parse-filepath"),
    path = require("path"),
    request = require("request");

var files = {

    copyLocalDir: function (source, destination, callback) {
        ncp.limit = 16;
        ncp(source, destination, function(err) {
            if (err) {
                return console.error(err);
            }
            if (typeof callback === "function") {
                callback();
            }
        });
    },

    // Copier un fichier vers target
    copyFile: function (source, target, callback) {

        // Executer callback avec readstream en parametre sauf si erreur de lecture
        function localReadStream (source, pipeStreams) {
            // Test if file exists and is readable
            fs.access(source, fs.F_OK | fs.R_OK, function (err) {
                if (!err) {
                    var readStream = fs.createReadStream(source);
                    readStream.on("error", function (err) {
                        pipeStreams(err);
                    });
                    pipeStreams(readStream);
                } else {
                    pipeStreams(err);
                }
            });
        }

        // Idem en ligne
        function remoteReadStream (source, pipeStreams) {
            request(source, function(err, response)  {
                if (err) {
                    pipeStreams(err);
                } else if (response.statusCode === 200) {
                    var stream = request.get(source)
                                        .on("error", function(err){
                                            console.error(err);
                                        });
                    pipeStreams(stream);
                } else {
                    pipeStreams(false);
                }
            });
        }

        function pipeStreams (readStream) {
            if (readStream && !readStream.pipe || typeof readStream.pipe !== "function") {
                callback(readStream);
                return;
            }
            var writeStream = fs.createWriteStream(target);
            readStream.pipe(writeStream);
            writeStream.on("finish", function() {
                writeStream.close(callback);
            });
        }

        callback = typeof callback === "function" ? callback : function () { return; };
        this.createDir(target);
        if (!isUrl(source)) {
            localReadStream(source, pipeStreams);
        } else {
            remoteReadStream(source, pipeStreams);
        }
    },

    // Vérifier l'existence du dossier de destination et le créer si nécessaire
    createDir: function (target) {
        var parsedPath = parsePath(target),
            destDir = parsedPath.extname ? parsedPath.dirname : target;
        try {
            mkdirp.sync(destDir);
        } catch (e) {
            if (e.code !== "EEXIST") throw e;
        }
        return destDir;
    },

    fileExists: function (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    },

    getDirectories: function (parentPath) {
        try {
            parentPath = parsePath(parentPath).absolute;
            return fs.readdirSync(parentPath).filter(function(file) {
                return fs.statSync(path.join(parentPath, file)).isDirectory();
            });
        } catch (err) {
            return [];
        }
    },

    isTextFile: function (path) {
        try {
            var fileStat = fs.statSync(path);
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
            if (typeof callback === 'function') {
                callback(err);
            }
        });
    }
};

module.exports = files;
