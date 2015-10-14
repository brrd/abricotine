// Tables

var celldown = require("celldown.js");

function tableCreate (cm, cols, rows) {
    cols = cols || 2;
    rows = rows || 1;
    var doc = cm.doc,
        table = celldown.new(cols, rows).get().table,
        cursorPos = doc.getCursor(),
        // CodeMirror's getCursor() returns a reference to cursor object, so we need to copy it before writing in it otherwise it would confuse CM for the next operations
        newCursorPos = {
            line: cursorPos.line,
            ch: cursorPos.ch
        },
        lineContent = doc.getLine(cursorPos.line);
    // Manage spaces before and after the table
    if (lineContent.trim() === "") {
        doc.replaceRange("", {line: cursorPos.line, ch: 0}, {line: cursorPos.line, ch: null});
        if (cursorPos.line !== doc.firstLine() && doc.getLine(cursorPos.line-1).trim() !== "") {
            table = "\n" + table;
        }
        if (cursorPos.line !== doc.lastLine() && doc.getLine(cursorPos.line+1).trim() !== "") {
            table = table + "\n";
        }
    } else {
        table = "\n\n" + table + "\n\n";
        newCursorPos.line += 2;
    }
    // Move cursor in the first cell
    newCursorPos.ch = 0;
    if (celldown.config.extraPipes) {
        newCursorPos.ch += 1;
    }
    if (celldown.config.extraSpaces) {
        newCursorPos.ch += 1;
    }
    // Inject table
    doc.replaceSelection(table);
    doc.setCursor(newCursorPos);
}

function tableGet (cm) {
    var pCoord = cm.getParagraphCoord(),
        pContent = cm.getParagraphContent(pCoord);
    if (!celldown.isValidTable(pContent)) {
        return null;
    }
    var cursor = cm.doc.getCursor();
    if (cursor.line >= pCoord.from && cursor.line <= pCoord.to) {
        cursor.line -= pCoord.from;
    } else {
        cursor = null;
    }
    var table = celldown.fromText(pContent, cursor);
    // Add a custom abrParagraph property to store table location in editor
    table.abrParagraph = pCoord;
    return table;
}

function tableInject (cm, table) {
    var pCoord = table.abrParagraph,
        t = table.beautify().get(),
        text = t.table,
        relativeCursor = t.cursor;
    cm.replaceRange(text,
        // from
        {
            line: pCoord.from,
            ch: 0
        },
        // to
        {
            line: pCoord.to,
            ch: null
        }
    );
    if (relativeCursor) {
        var cursor = {
            line: relativeCursor.line + pCoord.from,
            ch: relativeCursor.ch
        };
        cm.doc.setCursor(cursor);
    }
}

function tableDo (cm, action) {
    var args = [],
        table = tableGet(cm);
    if (!table) {
        console.log("No markdown table found in text"); // TODO: celldown should have an option for automatically converting text into table when string is not a valid markdown table
        return;
    }
    if (!table[action] || typeof table[action] !== "function") {
        console.error("'" + action + "' is not a valid Table (celldown.js) method");
        return;
    }
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    table[action].apply(table, args);
    tableInject(cm, table);
}

module.exports = function (CodeMirror) {
    CodeMirror.prototype.tableCreate = function (cols, rows) {
        tableCreate(this, cols, rows);
    };
    CodeMirror.prototype.tableGet = function () {
        tableGet(this);
    };
    CodeMirror.prototype.tableInject = function (table) {
        tableInject(this, table);
    };
    CodeMirror.prototype.tableDo = function (action) {
        tableDo(this, action);
    };
};
