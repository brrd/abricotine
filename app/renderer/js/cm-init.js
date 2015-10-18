var utils = require.main.require("../utils.js");

module.exports = function () {

    // Extend CodeMirror
    var pattern = "js/cm-extend-*.js",
        callback = function (mod, modPath) {
            if (typeof mod === "function") {
                mod(CodeMirror);
            } else {
                console.error("Module " + modPath + " is not a valid CodeMirror extension");
            }
        };
    utils.batchRequire(pattern, callback);

    // Ignore content into $$ delimiters (inline MathJax)
    // FIXME: This is dirty. We lose highlight until the end of the line. I should rewrite the markdown mode instead.
    CodeMirror.defineMode("abricotine", function (config) {
        return CodeMirror.multiplexingMode(
            CodeMirror.getMode(config, "gfm"),
            {open: "$$", close: "\n",
             mode: CodeMirror.getMode(config, "text/plain")}
            // .. more multiplexed styles can follow here
        );
    });

    var options = {
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
    // TODO: recode the mode.
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
    return cm;
};
