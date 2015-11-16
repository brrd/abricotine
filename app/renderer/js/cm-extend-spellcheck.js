var fs = require("fs");

function initSpellcheck (CodeMirror) {
    if (typeof Typo === "undefined") {
        return console.error("Typo.js not found");
    }
    var lang = "en_US"; // FIXME: lang
    // Load dictionary
    var aff = fs.readFileSync(__dirname + "/../dict/" + lang + "/" + lang + ".aff", "utf8");
    var dic = fs.readFileSync(__dirname + "/../dict/" + lang + "/" + lang + ".dic", "utf8");
    var dictionary = new Typo(lang, aff, dic);

    // Create overlay
    // Inspiration: https://github.com/NextStepWebs/codemirror-spell-checker/blob/master/src/js/spell-checker.js
    CodeMirror.defineMode("spellchecker", function (config, parserConfig) {
        var wordDelimiters = "!\"\'#$%&()*+,-./:;<=>?@[\\]^_`{|}~ ",
            overlay = {
        		token: function(stream, state) {
        			var ch = stream.peek(),
                        word = "";
        			if (wordDelimiters.includes(ch)) {
        				stream.next();
        				return null;
        			}
        			while ((ch = stream.peek()) != null && !wordDelimiters.includes(ch)) {
        				word += ch;
        				stream.next();
        			}
        			if (dictionary && !dictionary.check(word)) {
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
