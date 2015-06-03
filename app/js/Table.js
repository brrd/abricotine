/*
    Markdown table experiments
    ==========================
*/

/*
    PRIVATE FUNCTIONS
*/

function getRowArray (cols, content) {
    var row = [];
    for (var i=0; i<cols; i++) {
        row.push(content);
    }
    return row;
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

/*
    CONSTRUCTOR
*/

function Table () {
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
        this.arr = arguments[0];
    } else if (arguments.length === 1 && typeof arguments[0] === "string") {        
        this.arr = table2Array(arguments[0]);
    } else if (arguments.length >= 2 && 
               typeof arguments[0] === "number" && 
               typeof arguments[1] === "number"){
        this.empty.apply(this, arguments);
    } else {
        console.error("MarkdownTable: bad arguments in constructor");
    }
}

/*
    PUBLIC METHODS
*/

Table.prototype = {
    
    empty: function (cols, rows, hasHeader) {
        var lineRow = getRowArray(cols, "---"),
            emptyRow = getRowArray(cols, "   "),
            arr = hasHeader ? [emptyRow, lineRow] : [lineRow],
            count = hasHeader ? rows-1 : rows;
        for (var i=0; i<count; i++) {
            arr.push(emptyRow);
        }
        this.arr = arr;
        return this;
    },
    
    beautify: function () {
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
        resizeCells(this.arr, getColMaxSize(this.arr));
        return this;
    },
    
    getHeaderLineIndex: function (arr) {
        for (var i=0; i<=1 && i<arr.length; i++) {
            if (/^[-:]+$/.test(arr[i].join(""))) {
                return i;
            }
        }
        return false;
    },
    
    get: function () {
        return array2Table(this.arr);
    },
    
    getSize: function () {
        return {
            cols: this.arr[0].length,
            rows: this.arr.length
        };
    },
    
    addCol: function (index) {
        var where,
            fillingChar,
            arr = this.arr,
            headerLineIndex = this.getHeaderLineIndex(arr);
        for (var i=0; i<arr.length; i++) {
            where = index === undefined || index > arr[i].length ? arr[i].length : index;
            fillingChar = headerLineIndex === i ? "---" : "   ";
            arr[i].splice(where, 0, fillingChar);
        }
        return this;
    },
    
    addRow: function (index) {
        var arr = this.arr,
            headerLineIndex = this.getHeaderLineIndex(arr),
            size = this.getSize();
        index = index === undefined || index > size.rows ? size.rows : index;
        index = index <= headerLineIndex ? headerLineIndex + 1 : index;
        arr.splice(index, 0, getRowArray(size.cols, "   "));
        return this;
    },
    
    removeCol: function (index) {
        var arr = this.arr,
            size = this.getSize();
        if (index < 0 || index > size.cols-1) { return; }
        for (var i=0; i<size.rows; i++) {
            arr[i].splice(index, 1);
        }
        return this;
    }, 
    
    removeRow: function (index) {
        var arr = this.arr,
            size = this.getSize();
        if (index <= this.getHeaderLineIndex(arr) || index > size.rows-1) { return; }
        arr.splice(index, 1);
        return this;
    },
    
    align: function  (col, side) {
        var arr = this.arr;
        if (col < 0 || col > arr.length-1) { return; }
        var headerLineIndex = this.getHeaderLineIndex(arr),
            cell = headerLineIndex ? arr[headerLineIndex][col] : undefined,
            newCell = "";
        if (cell === undefined) {return;}
        for (var i=0; i<cell.length-2; i++) {
            newCell += "-";
        }
        switch (side) {
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
        return this;
    }
};

if (!module.parent) { 
    /*
        Playing with it ! 
    */

    var arr = [
        ["Premier", "Deuxième", "Troisième"],
        ["---", ":--", "--:"],
        ["Salut", "Une cellule", "Une autre !"],
        ["Encore une ligne", "Coucou", "Après j'arrête..."],
    ],
        str = "|Premier|Deuxième|Troisième|\n" +
        "|--|--|--|\n" +
        "|Salut|Une cellule|Une autre !|\n" +
        "|Encore une ligne|Coucou|Après j'arrête...|",
        tabSeparated = "Lorem\tIpsum\tDolorn" +
                        "aaaaa\tbbbb\tcccc"; // TODO: ajouter la possibilité d'importer des données avec un séprateur. Il faut alors ajouter un header (ou pas)

    var show = function (table, msg) {
        if (msg) {
            console.log(msg + "\n");
        }
        console.log(table.get() + "\n\n");
    };

    var t1 = new Table(5, 4, true);
    show(t1, "t1: Empty table");

    var t2 = new Table(arr);
    t2.align(1).align(0, "center");
    show(t2, "t2: Table from array with custom cols align");

    var t3 = new Table(str);
    t3.beautify();
    show(t3, "t3: Table from string + beautify");

    t3.addCol(2).addRow(4).beautify();
    show(t3, "Adding a col and a row to t3");

    t3.removeCol(1).removeRow(3).beautify();
    show(t3, "Removing a col and a row from t3");
} else {
    module.exports = Table;
}
