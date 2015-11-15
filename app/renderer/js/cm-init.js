var utils = require.main.require("../utils.js");

function extendCodeMirror () {
    return new Promise ( function (resolve, reject) {
        var pattern = "js/cm-extend-*.js",
            callbackSingle = function (mod, modPath) {
                if (typeof mod === "function") {
                    mod(CodeMirror);
                } else {
                    throw new Error("Module " + modPath + " is not a valid CodeMirror extension");
                }
            };
        utils.batchRequire(pattern, callbackSingle, resolve);
    });
}

function initCodeMirror () {
    return new Promise ( function (resolve, reject) {
        // Ignore content into $$ delimiters (inline MathJax)
        CodeMirror.defineMode("abricotine", function (config) {
            return CodeMirror.multiplexingMode(
                CodeMirror.getMode(config, {
                    name: "gfm",
                    highlightFormatting: true
                }),
                // Disable commented $
                {open: "\\$", close: " ",
                 mode: CodeMirror.getMode(config, "text/plain")},
                // Maths
                {open: "$$", close: "$$",
                 mode: CodeMirror.getMode(config, "text/x-latex")}
                // .. more multiplexed styles can follow here
            );
        });

        var options = {
            theme: "", // Disable CodeMirror themes
            addModeClass: true, // Used to disable colors on markdow lists (cm-variable-2, cm-variable-3, cm-keyword) but keep it in other modes
            lineNumbers: false,
            lineWrapping: true,
            autofocus: true,
            autoCloseBrackets: false,
            scrollbarStyle: "overlay",
            mode: "abricotine",
            // TODO: replace default keymap by a custom one which removes most of hotkeys (CodeMirror interferences with menu accelerators)
            extraKeys: {
                "Enter": "newlineAndIndentContinueMarkdownList",
                "Home": "goLineLeft",
                "End": "goLineRight",
                "Ctrl-Up": "goPrevParagraph",
                "Ctrl-Down": "goNextParagraph"
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
