/*
    Markdown table experiments
    ==========================
*/

function getRowArray (cols, content) {
    var row = [];
    for (var i=0; i<cols; i++) {
        row.push(content);
    }
    return row;
}

function getEmptyTable (cols, rows, hasHeader) {
    var lineRow = "|" + getRowArray(cols, "---").join("|") + "|",
        emptyRow = "|" + getRowArray(cols, "   ").join("|") + "|",
        table = hasHeader ? [emptyRow, lineRow] : [lineRow],
        count = hasHeader ? rows-1 : rows;
    for (var i=0; i<count; i++) {
        table.push(emptyRow);
    }
    return table.join("\n");
}

function array2Table (arr) {
    var row,
        table = [];
    for (var i=0; i<arr.length; i++) {
        row = arr[i];
        table.push("|" + row.join("|") + "|");
    }
    return table.join("\n");
}

function table2Array (table) {
    var arr = table.split("\n"),
        row;
    for (var i=0; i<arr.length; i++) {
        row = arr[i];
        if (row[0] === "|") {
            row = row.substr(1);
        }
        if (row[row.length-1] === "|") {
            row = row.substr(0, row.length-1);
        }
        arr[i] = row.split("|");
    }
    return arr;
}

function beautify (arr) {
    function eachCell (arr, callback) {
        var row,
            cell;            
        for (var rowIndex=0; rowIndex<arr.length; rowIndex++) {
            row = arr[rowIndex];
            for (var colIndex=0; colIndex<row.length; colIndex++) {
                cell = row[colIndex];
                callback(arr, cell, rowIndex, colIndex);
            }
        }
    }
    function getColMaxSize (arr) {
        var colMaxSize = [],
            callback = function (arr, cell, rowIndex, colIndex) {
                if (!colMaxSize[colIndex] || colMaxSize[colIndex] < cell.length) {
                    colMaxSize[colIndex] = cell.length;
                }
            };
        eachCell(arr, callback);
        return colMaxSize;
    }
    function resizeCells (arr, colMaxSize) {
        var callback = function (arr, cell, rowIndex, colIndex) { 
            var missingChars = colMaxSize[colIndex] - cell.length,
                fillingChar = /^:?-+:?$/.test(cell) ? "-" : " ",
                lastChar = cell.substr(-1, cell.length-1);
            while (missingChars > 0) {
                // Keep right align in headers
                if (fillingChar === "-" && lastChar === ":" && colMaxSize[colIndex] > 1) {
                    cell = cell.substr(0, cell.length-1) + fillingChar + lastChar;
                } else {
                    cell += fillingChar;
                }
                missingChars--;
            }
            arr[rowIndex][colIndex] = cell;
        };
        eachCell(arr, callback);
    }
    resizeCells(arr, getColMaxSize(arr));
    return arr;
}

function getHeaderLineIndex (arr) {
    for (var i=0; i<=1 && i<arr.length; i++) {
        if (/^[-:]+$/.test(arr[i].join(""))) {
            return i;
        }
    }
    return false;
}

function addColAt (arr, index) {
    var where,
        fillingChar,
        headerLineIndex = getHeaderLineIndex(arr);
    for (var i=0; i<arr.length; i++) {
        where = index === undefined || index > arr[i].length ? arr[i].length : index;
        fillingChar = headerLineIndex === i ? "---" : "   ";
        arr[i].splice(where, 0, fillingChar);
    }
}

function addRowAt (arr, index) {
    var headerLineIndex = getHeaderLineIndex(arr),
        cols = arr[0].length;
    index = index === undefined || index > arr.length ? arr.length : index;
    index = index <= headerLineIndex ? headerLineIndex + 1 : index;
    arr.splice(index, 0, getRowArray(cols, "   "));
}

function removeCol (arr, index) {
    if (index < 0 || index > arr[0].length-1) { return; }
    for (var i=0; i<arr.length; i++) {
        arr[i].splice(index, 1);
    }
}

function removeRow (arr, index) {
    if (index <= getHeaderLineIndex(arr) || index > arr.length-1) { return; }
    arr.splice(index, 1);
}

function setAlign (arr, col, align) {
    if (col < 0 || col > arr.length-1) { return; }
    var headerLineIndex = getHeaderLineIndex(arr),
        cell = headerLineIndex ? arr[headerLineIndex][col] : undefined,
        newCell = "";
    if (cell === undefined) {return;}
    for (var i=0; i<cell.length-2; i++) {
        newCell += "-";
    }
    switch (align) {
        case "left":
            newCell = ":" + newCell + "-";
            break;
        case "right":
            newCell = "-" + newCell + ":";
            break;
        case "center":
            newCell = ":" + newCell + ":";
            break;
        default:
            newCell = "-" + newCell + "-";
    }
    arr[headerLineIndex][col] = newCell;
}

// Playing with it !
var arr = [
        ["Premier", "Deuxième", "Troisième"],
        ["---", ":--", "--:"],
        ["Salut", "Une cellule", "Une autre !"],
        ["Encore une ligne", "Coucou", "Après j'arrête..."],
    ],
    table = "|Premier|Deuxième|Troisième|\n" +
            "|--|--|--|\n" +
            "|Salut|Une cellule|Une autre !|\n" +
            "|Encore une ligne|Coucou|Après j'arrête...|";

console.log(array2Table(arr));
console.log("\n\n");
console.log(array2Table(beautify(arr)));
console.log("\n\n");
console.log(table2Array(table));
console.log("\n\n");
console.log(array2Table(beautify(table2Array(table))));
console.log("\n\n");
addColAt(arr, 2);
console.log(array2Table(arr));
console.log("\n\n");
addRowAt(arr, 2);
console.log(array2Table(beautify(arr)));
console.log("\n\n");
removeCol(arr, 0);
removeRow(arr, 4);
console.log(array2Table(beautify(arr)));
console.log("\n\n");
setAlign(arr, 0);
setAlign(arr, 1, "left");
console.log(array2Table(beautify(arr)));