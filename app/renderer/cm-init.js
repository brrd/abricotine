/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var remote = require("@electron/remote"),
    baseMode = require("./cm-base-mode.js"),
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
                    var mod = require(modPath);
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
        defineAbrMode(CodeMirror, "abr-spellcheck-off", baseMode);
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
            indentWithTabs: true,
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

        // Indented wrapped line hack
        // https://codemirror.net/demo/indentwrap.html
        CodeMirror.defineOption("actualCharWidth", $(".ruler").width(), fixTodolistWidth);
        var todolistStyleEl = document.getElementById("todolist-style");
        var todolistLength = 3;
        var basePadding = 20,
            bulletRe = /^([\t ]*)((\*|-|\+|>)( +\[( *|x)?\])?|[0-9]+\.)[\t ]+/;

        function fixTodolistWidth (cm, value) {
            var charWidth = value || $(".ruler").width();
            formerCharWidth = charWidth;
            var todolistWidth = todolistLength * charWidth;
            todolistStyleEl.innerHTML = "span.todolist:before { width: " + todolistWidth + "px }";
        }

        cm.on("renderLine", function(cm, line, el) {
            var charWidth = cm.getOption("actualCharWidth");
            var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;

            // Get list and quote bullet width
            var lineNumber = cm.getLineNumber(line);
            var tokenType = cm.getTokenTypeAt({line: lineNumber}) || "";
            var type = tokenType.split(" ");
            var isList = type.includes("m-markdown") && (type.includes("list") || type.includes("quote"));
            var bulletWidth = 0;
            if (isList) {
                var match = line.text.match(bulletRe);
                if (match !== null) {
                    if (match[4]) {
                        // Todolist
                        bulletWidth = todolistLength * charWidth;
                    } else {
                        bulletWidth = (match[0].length - match[1].length) * charWidth;
                    }
                }
            }

            el.style.textIndent = "-" + (off + bulletWidth) + "px";
            el.style.paddingLeft = (basePadding + off + bulletWidth) + "px";
        });

        cm.refresh();

        resolve(cm);
    });
}

module.exports = function (callback) {
    extendCodeMirror().then(initCodeMirror).then(callback);
};
