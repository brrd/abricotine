/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var nspell = require("nspell");

var dictionary, spellchecker;

process.on("message", function(msg) {
	if (msg.dictionary) {
		dictionary = require(msg.dictionary);
		dictionary(function(err, dict) {
			if (err) {
					throw err
			}
			spellchecker = nspell(dict);
		});
	} else if (spellchecker && msg.word) {
		// TODO: bloquer ici si dict pas encore chargé ?
		var isMisspelled = !spellchecker.correct(msg.word);
		if (isMisspelled) {
			process.send({ misspelled: msg.word });
		}
	}

}, false);