/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

// Paragraph functions for CodeMirror

// Returns false if line is blank or a {from: lineNumber, to: lineNumber} object otherwise
function getParagraphCoord (posOrLine, cm) {
    function isEmptyLine (lineNumber) {
        return doc.getLine(lineNumber).trim() === "";
    }
    function getBoundary (lineNumber, step) {
        var i = lineNumber,
            min = doc.firstLine(),
            max = doc.lastLine();
        step = step < 0 ? step = -1 : step = 1;
        while (i >= min && i<= max) {
            if (isEmptyLine(i)) {
                return i - step;
            }
            i += step;
        }
        return step === -1 ? min : max;
    }
    var doc = cm.doc,
        lineNumber;
    if (typeof posOrLine === "object" && posOrLine.line) {
        lineNumber = posOrLine.line;
    } else if (typeof posOrLine === "number") {
        lineNumber = posOrLine;
    } else {
        lineNumber = doc.getCursor().line;
    }
    return isEmptyLine(lineNumber) ? false : {
        from: getBoundary(lineNumber, -1),
        to: getBoundary(lineNumber, 1)
    };
}

function getParagraphContent (arg, cm) {
    var coord = arg.from && arg.to ? arg : cm.getParagraphCoord(arg, cm);
    return cm.doc.getRange(
        // from
        {
            line: coord.from,
            ch: 0
        },
        // to
        {
            line: coord.to,
            ch: null
        }
    );
}

function goToParagraph (direction, cm) {
    if (direction !== "up" && direction !== "down") {
        return;
    }
    var currentPos = cm.doc.getCursor(),
        currentParagraph = getParagraphCoord(currentPos, cm),
        line = currentParagraph ? (direction === "up" ? currentParagraph.from : currentParagraph.to) : currentPos.line,
        paragraphToGo = false,
        nextPos = {
            line: line,
            ch: 0
        };
    while (paragraphToGo === false &&
        (
            (direction === "up" && line > cm.doc.firstLine()) ||
            (direction === "down" && line < cm.doc.lastLine())
        )) {
        line += direction === "up" ? -1 : 1;
        paragraphToGo = getParagraphCoord(line, cm);
    }
    if (paragraphToGo !== false) {
        nextPos.line = paragraphToGo.from;
    }
    cm.doc.setCursor(nextPos);
}

module.exports = function (CodeMirror) {
    CodeMirror.prototype.getParagraphCoord = function (posOrLine) {
        getParagraphCoord(posOrLine, this);
    };
    CodeMirror.prototype.getParagraphContent = function (arg) {
        getParagraphContent(arg, this);
    };
    CodeMirror.commands.goPrevParagraph = function (cm) {
        goToParagraph("up", cm);
    };
    CodeMirror.commands.goNextParagraph = function (cm) {
        goToParagraph("down", cm);
    };
    return CodeMirror;
};
