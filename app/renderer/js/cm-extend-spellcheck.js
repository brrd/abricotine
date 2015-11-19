var fs = require("fs");

function initSpellcheck (CodeMirror) {
    // Create overlay
    // Inspiration: https://github.com/NextStepWebs/codemirror-spell-checker/blob/master/src/js/spell-checker.js
    CodeMirror.defineMode("spellchecker", function (config, parserConfig) {
        var wordDelimiters = "!\"#$%&()*+,-./:;<=>?@[\\]^_`{|}~ ",
            overlay = {
        		token: function(stream, state) {
        			var ch = stream.peek(),
                        word = "",
                        isMisspelledFunc = window.abrDoc.getSpellcheckFunc();
                    if (!isMisspelledFunc) {
                        return null;
                    }
        			if (wordDelimiters.includes(ch)) {
        				stream.next();
        				return null;
        			}
        			while ((ch = stream.peek()) != null && !wordDelimiters.includes(ch)) {
        				word += ch;
        				stream.next();
        			}
        			if (isMisspelledFunc && isMisspelledFunc(word)) {
        				return "spell-error"; // CSS class: cm-spell-error
                    }
        			return null;
        		}
        	},
            mode = CodeMirror.getMode(config, {
                name: "gfm",
                highlightFormatting: true
            });
        return CodeMirror.overlayMode(mode, overlay, true);
    });
}

module.exports = initSpellcheck;
