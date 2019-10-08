/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var equal = require("deep-equal");

// Find headers in text and return ToC + lineNumbers
// Line numbers are stored in a separate object to avoid a total DOM refresh when the only change is lines added/removed
function gettocAndLineNumbers (text) {
    var toc = [],
        lineNumbers = [],
        lines = text.split("\n"),
        isCode = false;
        checkYaml = true;
        isYaml = false;
        belowEmptyLine = true;
    lines.forEach( function (line, index) {
        // Skip lines in code blocks
        var codeMatch = line.match(/^\s*```/);
        if (codeMatch) {
            isCode = !isCode;
        }
        if (isCode || codeMatch) {
            belowEmptyLine = true;  // This line can't be a heading
            return;
        }
        // Skip lines in YAML block
        if (isYaml || checkYaml) {
            if (isYaml) {
                if(line.match(/^(---|\.\.\.)/)) {
                    isYaml = false;
                    belowEmptyLine = true;  // This line can't be a heading
                    return;     // Ignore terminating marker itself
                }
            } else if (checkYaml && line.match(/^---/)) {
                isYaml = true;
                checkYaml = false;
            } else if (line) {
                checkYaml = false;
            }
            if (isYaml) return;
        }
        // # headers
        var headerMatch = line.match(/^(#+)(.*)#*$/);
        if (headerMatch) {
            toc.push({
                content: headerMatch[2].trim(),
                level: headerMatch[1].length
            });
            lineNumbers.push(index);
        }
        // Underlined headers
        var underlineMatch = line.match(/^\s*(=|-)+$/);
        if (
            underlineMatch &&
            // above line actually contains something (i. e. not <hr />)
            !belowEmptyLine &&
            // header isnt already registered
            !(toc.length > 0 && lineNumbers[lineNumbers.length - 1] === index - 1)
        ) {
            toc.push({
                content: (lines[index - 1] || "").trim(),
                level: underlineMatch[1] === "=" ? 1 : 2
            });
            lineNumbers.push(index - 1);
        }
        // Check if --- on the next line could possibly indicate a heading
        if (line.trim()) {
            belowEmptyLine = false;
        } else {
            belowEmptyLine = true;
        }
    });
    return {
        toc: toc,
        lineNumbers: lineNumbers
    };
}

// Return index of the current active header
function getActiveHeaderIndex (toc, lineNumbers, cursorLine) {
    var res;
    toc.forEach( function (header, index) {
        var line = lineNumbers[index];
        if (cursorLine >= line && header.content) {
            res = index;
        } else {
            return;
        }
    });
    return res;
}

// Keep a track of toc
var toc = [],
    lineNumbers = [];

// Listen to AbrPane
process.on("message", function(msg) {
    var answer = {};
    // Update toc if text provided ("changes" event)
    if (msg.text != null) {
        var tocAndLineNumbers = gettocAndLineNumbers(msg.text),
            newToc = tocAndLineNumbers.toc;
        if (!equal(newToc, toc)) {
            answer.toc = toc = newToc;
        }
        answer.lineNumbers = lineNumbers = tocAndLineNumbers.lineNumbers;
    }
    // Update active header ("changes" + "cursorActivity" events)
    answer.activeHeaderIndex = getActiveHeaderIndex(toc, lineNumbers, msg.cursorLine);
    process.send(answer);
}, false);
