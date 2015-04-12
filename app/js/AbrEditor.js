// Wrapper CodeMirror    
// C'est ici qu'on a les fonctions ital, bold, etc.
// Most of the methods are aliases to CodeMirror functions

var md4cm = loadComponent('md4cm');

function AbrEditor (abrDocument) {
    this.init();
    this.abrDocument = abrDocument;
    this.routines = this.defaultRoutines();
    
    // TODO: Ranger et factoriser
    var that = this;
    this.cm.on("cursorActivity", function (cm, changeObj) {
        that.execRoutines("cursorActivity");
    });
}

AbrEditor.prototype.init = function () {
    // TODO: probablement qu'il serait mieux de changer quelques unes de ces fonctions en méthodes
    
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

    function setEvents (cm) {
        cm.on("change", function(/*cm, change*/) {
            that.abrDocument.updateWindowTitle();
        });
    }
    
    function fixFocus (cm) {
        // var watch = cm.getWrapperElement();
        // FUTURE: Pour l'instant il n'y a rien d'autre dans le body donc :
        var watch = document.body;
        watch.addEventListener('click', function() {
            if (!cm.hasFocus()) {
                cm.focus();
            }
        }, false);
    }

    var that = this, // TODO: revoir closure
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
        }, // FIXME: replace default keymap by a custom one which removes most of hotkeys (CodeMirror interferences with menu accelerators)
        target = document.getElementById("cm"),        
        cm = CodeMirror.fromTextArea(target, options);
    
    addTrailingWhitespace(cm);
    notBlankLines(cm);
    setEvents(cm);
    fixFocus(cm);
    this.cm = cm;
    this.setClean();
};

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

// ----
// Les routines sont des opérations qui sont effectuées sur chaque ligne quand des évenements sont déclanché. Utiliser les routines permet de ne parser le texte qu'une seule fois pour plusieurs opérations.
/*
    routine = {
        name: string,
        context: {},
        prepare: function (),
        eachLine: function (line),
        callback: function (),
        editor: abrEditor (created when attachRoutine())
    }
*/

// Unused
AbrEditor.prototype.attachRoutine = function (routine, eventName) {
    if (!routine || !eventName || !routine.name) { return; }
    if (!this.routines[eventName]) {
        this.routines[eventName] = [];
    }
    routine.editor = this;
    this.routines[eventName].push(routine);
};

AbrEditor.prototype.execRoutines = function (eventName) {
    function eachRoutine (routines, methodName, args) {
        var routine,
            result;
        for (var i=0; i<routines.length; i++) {
            routine = routines[i];
            if (!routine.context) {
                routine.context = {};
            }
            if (!routine.editor) {
                routine.editor = that;
            }
            if (routine[methodName] && typeof routine[methodName] === "function") {
                result = routine[methodName](args);  
                routine.context = result || routine.context;
            }
        }
    }
    var that = this,
        routines = this.routines[eventName],
        doc = this.cm.doc;
    if (!routines) {
        console.log("No routine found for " + eventName + " event");
        return false;
    }
    eachRoutine(routines, 'prepare');
    doc.eachLine( function (line) {
        eachRoutine(routines, 'eachLine', line);
    });
    eachRoutine(routines, 'callback');
};

// TODO: prendre en compte ![Alt text](/path/to/img.jpg "Optional title")
// TODO: chercher l'image dans le répertoire d'enregistrement (s'il existe) si le chemin n'est pas une url
AbrEditor.prototype.replaceImage = function (startPos, endPos, url, alt) {
    function isAbsoluteUrl (url) { // TODO: placer dans utils
        var r = new RegExp('^(?:[a-z]+:)?//', 'i');
        return r.test(url);
    }
    if (!url) { return; }
    if (!isAbsoluteUrl(url) && this.abrDocument.path) {
        url = this.abrDocument.getDir() + '/' + url;
    }
    alt = alt || '';
    var from = startPos,
        to = endPos,
        element = $('<img>').attr('src', url).attr('alt', alt).error(function(){
            $(this).attr('src', 'https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/32/error.png'); // TODO: plutot utiliser une classe à styler
        }).get(0);
    var doc = this.cm.doc,
        textMarker = doc.markText(from, to, {
        replacedWith: element,
        clearOnEnter: false,
        handleMouseEvents: true,
        inclusiveLeft: true,
        inclusiveRight: true
    });
    textMarker.on("beforeCursorEnter", function () {
        if (!doc.somethingSelected()) { // Fix blink on selection
            textMarker.clear();
        }
    });              
};

AbrEditor.prototype.replaceInLine = function (line, regex, callback) {
    function lineIsSelected (lineNumber) { // FIXME: ne fonctionne pas en cas de sélection multiple (on peut l'interdire pour simplifier ?)
        var cursor = {
            begin: doc.getCursor("from"),
            end: doc.getCursor("to")
        };
        return !(cursor.begin.line > lineNumber || cursor.end.line < lineNumber);
    }
    var doc = this.cm.doc,
        lineNumber,
        match,
        alt, 
        url, 
        startPos, 
        endPos;
    if (typeof line === 'number') {
        lineNumber = line;
        line = doc.getLineHandle(line);
    } else {
        lineNumber = doc.getLineNumber(line);
    }
    if (lineIsSelected(lineNumber)){ return; }
    while ((match = regex.exec(line.text)) !== null) {
        alt = match[1];
        url = match[2];
        startPos = {
            line: lineNumber,
            ch: match.index
        };
        endPos = {
            line: lineNumber,
            ch: startPos.ch + match[0].length
        };
        if (doc.findMarks(startPos, endPos).length > 0) {
            continue;
        }
        callback(startPos, endPos, url, alt);
    }
    
};

AbrEditor.prototype.defaultRoutines = function () {
    var that = this;
    return {
        cursorActivity: [
            {
                name: "livePreview",
                eachLine: function (line) {
                    var regex = /!\[([-a-zA-Z0-9@:%._\+~#=\.\/! ]*)\]\(([-a-zA-Z0-9@:%._\+~#=\.\/]+\.(jpg|jpeg|png|gif|svg))\)/gi;
                    var callback = function () {
                        return that.replaceImage.apply(that, arguments);
                    };
                    that.replaceInLine(line, regex, callback);
                }
            }
        ]
    };
};

module.exports = AbrEditor;