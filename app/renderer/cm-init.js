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
            // TODO: replace default keymap by a custom one which removes most of hotkeys (CodeMirror interferences with menu accelerators)
            extraKeys: {
                "Enter": "newlineAndIndentContinueMarkdownList",
                "Home": "homeList",
                "End": "goLineRight",
                "Ctrl-Up": "goPrevParagraph",
                "Ctrl-Down": "goNextParagraph",
                "Tab": "indentList",
                "Shift-Tab": "indentLess"
            }
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
        resolve(cm);
    });
}

module.exports = function (callback) {
    extendCodeMirror().then(initCodeMirror).then(callback);
};
