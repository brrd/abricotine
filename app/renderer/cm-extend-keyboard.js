/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

/* jshint esversion: 6 */
module.exports = function (CodeMirror) {
    CodeMirror.commands.homeList = function (cm) {
        const pos = cm.getCursor();
        const eolTokenType = cm.getTokenTypeAt({line: pos.line});
        const inList = eolTokenType && eolTokenType.includes("list");
        const line = cm.getLine(pos.line);
        const bulletRegex = /^(\s*(?:\*|\-|\+)(?:\s+\[(?: |x)?\])?\s)/;
        const textBeforeCursor = line.slice(0, pos.ch);
        const cursorAfterBullet = bulletRegex.test(textBeforeCursor);

        if (!inList || !cursorAfterBullet) {
          return cm.execCommand("goLineLeftSmart");
        }

        // Move cursor to bullet
        const beforeBullet = line.split(bulletRegex);
        const bulletPos = beforeBullet[0].length;
        const bulletLength = beforeBullet[1].length;
        const newCh = bulletPos + bulletLength;
        // ...except if it's already there
        if (newCh === pos.ch) {
          return cm.execCommand("goLineLeftSmart");
        }
        cm.setCursor({line: pos.line, ch: newCh});
    };

    CodeMirror.commands.indentList = function(cm) {
        const pos = cm.getCursor();
        const eolTokenType = cm.getTokenTypeAt({line: pos.line});
        const inList = eolTokenType && eolTokenType.includes("list");
        if (inList) {
          return cm.execCommand("indentMore");
        }
        cm.execCommand("defaultTab");
    };

    CodeMirror.commands.toggleCase = function(cm) {
        const texts = cm.getSelections();
        const isLowerCase = (str) => str === str.toLowerCase();
        const isUpperCase = (str) => str === str.toUpperCase();
        const toTilleCase = (str) => str.toLowerCase().replace(/^(.)|\s(.)/g, ($1) => $1.toUpperCase());
        const replacements = texts.map((text) => {
          if (isLowerCase(text)) {
            return text.toUpperCase();
          }
          if (isUpperCase(text)) {
            return toTilleCase(text);
          }
          return text.toLowerCase();
        });
        cm.replaceSelections(replacements, "around");
    };
};
