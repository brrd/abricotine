/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("electron").remote,
    constants = remote.require("./constants.js"),
    glob = require("glob"),
    pathModule = require("path");

// pattern is glob pattern. Due to node require scope limitations, it must be the full path from app/.
// options is glob options
// cbSingle(mod, modPath) is the callback to execute after module is loaded
// cbAll([mods]) is the callback to execute after all modules are loaded
function batchRequire (cwd, pattern, cbSingle, cbAll) {
    glob(pattern, { cwd: cwd }, function (err, files) {
        if (err !== null) {
            console.error("Glob error");
            return;
        }
        var modPath,
            promises = [],
            getAPromise = function (modPath, callback) {
                return new Promise (function (resolve, reject) {
                    var mod = require.main.require(modPath);
                    if (typeof callback === "function") {
                        callback(mod, modPath);
                    }
                    resolve(mod);
                });
            };
        for(var i=0; i<files.length; i++){
            modPath = pathModule.join(__dirname, files[i]);
            promises.push(getAPromise(modPath, cbSingle));
        }
        Promise.all(promises).then(cbAll);
    });
}

function extendCodeMirror () {
    return new Promise ( function (resolve, reject) {
        var cwd = pathModule.join(constants.path.app, "/app/renderer/"),
            pattern = "cm-extend-*.js",
            callbackSingle = function (mod, modPath) {
                if (typeof mod === "function") {
                    mod(CodeMirror);
                } else {
                    throw new Error("Module " + modPath + " is not a valid CodeMirror extension");
                }
            };
        batchRequire(cwd, pattern, callbackSingle, resolve);
    });
}

function defineAbrMode (CodeMirror, newModeName, baseMode) {
    CodeMirror.defineMode(newModeName, function (config) {
        return CodeMirror.multiplexingMode(
            CodeMirror.getMode(config, baseMode),
            // Disable commented $
            {open: "\\$", close: " ",
             mode: CodeMirror.getMode(config, "text/plain")},
            // Maths
            {open: "$$", close: "$$",
             mode: CodeMirror.getMode(config, "text/x-latex"),
             delimStyle: "formatting formatting-math",
             parseDelimiters: false
            }
            // .. more multiplexed styles can follow here
        );
    });
}

function initCodeMirror () {
    return new Promise ( function (resolve, reject) {
        // Spelling and no-spelling modes shortcuts
        defineAbrMode(CodeMirror, "abr-spellcheck-off", {
            // FIXME: duplicate code
            name: "gfm",
            highlightFormatting: true,
            allowAtxHeaderWithoutSpace: true,
            tokenTypeOverrides: {
                "list1": "list",
                "list2": "list",
                "list3": "list"
            }
        });
        defineAbrMode(CodeMirror, "abr-spellcheck-on", "spellchecker");

        var options = {
            theme: "", // Disable CodeMirror themes
            addModeClass: true, // Used to disable colors on markdow lists (cm-variable-2, cm-variable-3, cm-keyword) but keep it in other modes,
            lineNumbers: false,
            lineWrapping: true,
            autofocus: true,
            autoCloseBrackets: false,
            scrollbarStyle: "overlay",
            mode: "abr-spellcheck-off",
            indentUnit: 4,
            tabSize: 4,
            keyMap: "abricotine"
        };

        // Start editor
        var cm = CodeMirror.fromTextArea(document.getElementById("cm"), options);

        // Adding custom overlays
        // Strike checked list items
        cm.addOverlay({
            token: function(stream) {
                if (stream.match(/^\* \[x\].*/)) {
                    return "checked-list-item";
                }
                stream.match(/^\s*\S*/);
                return null;
            }
        });
        // Add trailing whitespaces
        cm.addOverlay({
            token: function(stream) {
                if (stream.match(/^\s\s+$/)) {
                    return "trailing-whitespace";
                }
                stream.match(/^\s*\S*/);
                return null;
            }
        });
        // (Not) Blank lines (show-blocks option)
        cm.addOverlay({
            token: function(stream) {
                stream.match(/^\s*\S*/);
                return "line-not-blank";
            }
        });
        // Code blocks
        cm.addOverlay({
            token: function(stream) {
                if (stream.start > 0) {
                  stream.match(/^\s*\S*/);
                  return null;
                }

                stream.match(/^\s*/);
                var baseToken = stream.baseToken();
                if (!baseToken || !baseToken.type) return null;
                var type = baseToken.type.split(" ");
                stream.match(/^\s*\S*/);

                var hasTypeFormattingCodeblock = type.includes("formatting-code-block");
                var hasTypeFormattingCode = type.includes("formatting-code");
                var hasTypeFormattingMath = type.includes("formatting-math");
                var hasTypeMarkdown = type.includes("m-markdown");
                var hasTypeComment = type.includes("comment");

                if (hasTypeFormattingCode || hasTypeFormattingMath) {
                  return null;
                }
                if (hasTypeFormattingCodeblock) {
                    return "line-background-codeblock-delimiter";
                }
                if (!hasTypeMarkdown || (hasTypeComment && hasTypeMarkdown)) {
                    return "line-background-codeblock";
                }
                return null;
            }
        });
        // Code blocks: empty lines workaround
        cm.on("update", function (cm, arg) {
          cm.eachLine(function (line) {
            var isBlank = line.text === "";
            if (!isBlank) return;
            var lineNumber = cm.getLineNumber(line);
            var mode = cm.getModeAt({line: lineNumber});
            if (mode.name && mode.name === "markdown") {
              cm.removeLineClass(line, "background", "codeblock");
              return;
            }
            cm.addLineClass(line, "background", "codeblock");
          });
        });
        resolve(cm);
    });
}

module.exports = function (callback) {
    extendCodeMirror().then(initCodeMirror).then(callback);
};
