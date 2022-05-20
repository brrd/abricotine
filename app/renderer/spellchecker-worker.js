/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var nspell = require("nspell");

var dictionary, spellchecker, lang;

process.on("message", function(msg) {
	if (msg.dictionary === false) {
		dictionary = null;
		spellchecker = null;
		lang = null;

	} else if (msg.dictionary && msg.lang) {
		dictionary = require(msg.dictionary);
		lang = msg.lang;
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
			process.send({ misspelled: msg.word, lang });
		}
	}

}, false);