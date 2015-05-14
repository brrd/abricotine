// Wrapper CodeMirror    
// C'est ici qu'on a les fonctions ital, bold, etc.
// Most of the methods are aliases to CodeMirror functions

var md4cm = loadComponent('md4cm');

function AbrEditor (abrDocument) {
    function addTrailingWhitespace (cm) {
        cm.addOverlay({
            token: function(stream) {
                if (stream.match(/^\s\s+$/)) {
                    return "trailing-whitespace";
                }
                stream.match(/^\s*\S*/);
                return null;
            }
        });
    }
    function notBlankLines (cm) {
        cm.addOverlay({
            token: function(stream) {
                stream.match(/^\s*\S*/);
                return "line-not-blank";
            }
        });
    }
    var that = this, 
        options= {
            lineNumbers: false,
            lineWrapping: true,
            styleActiveLine: true, // Focusmode
            autofocus: true,
            scrollbarStyle: "overlay",
            mode: "gfm",
            extraKeys: {
                "Enter": "newlineAndIndentContinueMarkdownList",
                "Home": "goLineLeft", 
                "End": "goLineRight"
            }
        }; // FIXME: replace default keymap by a custom one which removes most of hotkeys (CodeMirror interferences with menu accelerators)
    this.cm = CodeMirror.fromTextArea(document.getElementById("cm"), options);
    addTrailingWhitespace(this.cm);
    notBlankLines(this.cm);
    this.setClean();
    this.abrDocument = abrDocument;
    
    // Events
    this.cm.on("cursorActivity", function (cm) {
        var previewInLine = loadComponent("previewInLine");
        that.cm.doc.eachLine( function (line) {
            previewInLine(that.cm, line, ["image", "checkbox", "iframe"]);
        });
    });
    this.cm.on("changes", function (cm, changeObj) {
        that.abrDocument.updateWindowTitle();
        that.updateToc();
    });
}

AbrEditor.prototype.toggle = function (type) {
    md4cm.toggle(type)(this.cm);
};

AbrEditor.prototype.draw = function (type) {
    md4cm.draw(type)(this.cm);
};

AbrEditor.prototype.getStateAt = function (pos) {
    return md4cm.getState(this.cm, pos);
};

AbrEditor.prototype.getData = function () {
    return this.cm.doc.getValue();
};

AbrEditor.prototype.setData = function (data) {
    return this.cm.doc.setValue(data); // TODO: return ?
};

AbrEditor.prototype.clearData = function () {
    return this.cm.doc.setValue(""); // TODO: return ?
};

AbrEditor.prototype.isClean = function () {
    return this.cm.doc.isClean(this.latestGeneration);
};

AbrEditor.prototype.getGeneration = function () {
    return this.cm.doc.changeGeneration();
};

AbrEditor.prototype.setClean = function () {
    this.latestGeneration = this.getGeneration();
};

AbrEditor.prototype.execCommand = function (cmd) {
    this.cm.execCommand(cmd);
};

AbrEditor.prototype.getMarkers = function (selector) {
    var doc = this.cm.doc,
        markers = doc.getAllMarks(),
        collection = [],
        element;
    if (!selector) {
        return markers;
    }
    for (var i=0; i<markers.length; i++) {
        element = markers[i].replacedWith;
        if (element.matches(selector)) {
            collection.push(markers[i]);
        }
    }
    return collection;
};

AbrEditor.prototype.clearMarkers = function (selector) {
    var doc = this.cm.doc,
        markers = this.getMarkers(selector);
    for (var i=0; i<markers.length; i++) {
        markers[i].clear();
    }
};

AbrEditor.prototype.getParagraph = function (lineNumber) {
    var p = this.paragraphs;
    if (typeof lineNumber === "undefined") {
        lineNumber = this.cm.doc.getCursor().line;
    }
    for (var i=0; i<p.length; i++) {
        if (lineNumber >= p[i].from && lineNumber <= p[i].to) {
            return i;
        }
    }
};

AbrEditor.prototype.applyClassToParagraph = function (paragraph, className, where) {
    where = where || "text";
    var doc = this.cm.doc;
    for (var i=paragraph.from; i<=paragraph.to+1; i++) {
        doc.addLineClass(i, where, className);
        
    }
};

AbrEditor.prototype.updateToc = function () {
    var that = this,
        toc = [],    
        prevLine; 
    this.cm.doc.eachLine( function (line) {
        var lineNumber = that.cm.doc.getLineNumber(line),
            state = that.getStateAt({line: lineNumber, ch: 1});
        if (state.header) {
            // Handle underlined headers. TODO: fix header preview in CodeMirror
            if ((state.h1 || state.h2) && /^(=|-)+$/.test(line.text.trim())) {
                toc.push ({
                    content: prevLine.text,
                    level: state.header,
                    line: lineNumber - 1
                });
            } else {
                toc.push ({
                    content: line.text,
                    level: state.header,
                    line: lineNumber
                });
            }
        }
        prevLine = line;
    });
    Abricotine.setTocHtml(toc);
};

module.exports = AbrEditor;