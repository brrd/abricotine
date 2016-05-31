/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var equal = require("deep-equal");

// Find headers in text and return ToC
function getToc (text) {
    var toc = [],
        lines = text.split("\n"),
        isCode = false;
    lines.forEach( function (line, index) {
        // Skip lines in code blocks
        var codeMatch = line.match(/^\s*```/);
        if (codeMatch) {
            isCode = !isCode;
        }
        if (isCode) return;
        // # headers
        var headerMatch = line.match(/^(#+)(.*)#*$/);
        if (headerMatch) {
            toc.push({
                content: headerMatch[2].trim(),
                level: headerMatch[1].length,
                line: index
            });
        }
        // Underlined headers
        var underlineMatch = line.match(/^\s*(=|-)+$/);
        if (
            underlineMatch &&
            // not first line
            index !== 0 &&
            // header isnt already registered
            !(toc.length > 0 && toc[toc.length - 1].line === index - 1)
        ) {
            toc.push({
                content: (lines[index - 1] || "").trim(),
                level: underlineMatch[1] === "=" ? 1 : 2,
                line: index - 1
            });
        }
    });
    return toc;
}

// Return index of the current active header
function getActiveHeaderIndex (toc, cursorLine) {
    var res;
    toc.forEach( function (header, index) {
        if (cursorLine >= header.line && header.content) {
            res = index;
        } else {
            return;
        }
    });
    return res;
}

// Keep a track of toc
var toc = [];

// Listen to AbrPane
process.on("message", function(msg) {
    var answer = {};
    // Update toc if text provided ("changes" event)
    if (msg.text != null) {
        var newToc = getToc(msg.text);
        if (!equal(newToc, toc)) {
            answer.toc = toc = newToc;
        }
    }
    // Update active header ("changes" + "cursorActivity" events)
    answer.activeHeaderIndex = getActiveHeaderIndex(toc, msg.cursorLine);
    process.send(answer);
}, false);
