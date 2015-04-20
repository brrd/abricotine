// Wrapper CodeMirror    
// C'est ici qu'on a les fonctions ital, bold, etc.
// Most of the methods are aliases to CodeMirror functions

var md4cm = loadComponent('md4cm');

function AbrEditor (abrDocument) {
    this.init();
    this.abrDocument = abrDocument;
    this.routines = this.defaultRoutines();
    
    // TODO: Ranger et automatiser/factoriser
    var that = this;
    this.cm.on("cursorActivity", function (cm, changeObj) {
        that.execEventRoutines("cursorActivity");
    });
    this.cm.on("changes", function (cm, changeObj) {
        that.execEventRoutines("changes");
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
        // var watch = document.getElementById("editor");
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

// Batch markText functions

// TODO: chercher l'image dans le répertoire d'enregistrement (s'il existe) si le chemin n'est pas une url
AbrEditor.prototype.replaceImage = function (startPos, endPos, url, alt, title) {
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
        $element = $('<img>').attr('src', url).attr('alt', alt);
    if (title) {
        $element.attr("title", title);
    }
    $element.error(function(){
        $(this).replaceWith("<span class='autopreview-error'>Image not found: " + url + "</span>");
    });
    var element = $element.get(0),
        doc = this.cm.doc,
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
        callback(startPos, endPos, match);
    }
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

// Routines
// Les routines sont des opérations qui sont effectuées sur chaque ligne quand des évenements sont déclanché. Utiliser les routines permet de ne parser le texte qu'une seule fois pour plusieurs opérations.
/*
    routine = {
        variables: {}, // NOTE: Be aware that variable will NOT be reset before the routine runs again. If you want to reset variables you must do it in the beforeLoop() function.
        condition: function () > bool,
        beforeLoop: function (),
        loop: function (line),
        afterLoop: function (),
    }
*/

AbrEditor.prototype.execRoutines = function (routines, checkConfig) {
    function hasExecutableRoutines (routines) {
        var isExecutableRoutine = false,
            routine;
        for (var i=0; i<routines.length; i++) {
            routine = routines[i];
            isExecutableRoutine = !routine.condition || (typeof routine.condition === "function" && routine.condition());
            if (isExecutableRoutine) {
                break;
            }
        }
        return isExecutableRoutine;
    }
    function eachRoutine (routines, methodName, args) {
        var routine;
        for (var i=0; i<routines.length; i++) {
            routine = routines[i];
            if (!routine.variables) {
                routine.variables = {};
            }
            if (routine[methodName] && typeof routine[methodName] === "function") {
                routine[methodName](args);  
            }
        }
        return;
    }
    var that = this,
        doc = this.cm.doc;
    if (checkConfig && !hasExecutableRoutines(routines)) {
        return;
    }
    eachRoutine(routines, 'beforeLoop');
    doc.eachLine( function (line) {
        eachRoutine(routines, 'loop', line);
    });
    eachRoutine(routines, 'afterLoop');
};

AbrEditor.prototype.execRoutine = function (routineName) {
    var routine = this.routines[routineName];
    if (!routine) {
        console.error("Routine '" + routineName + "' not found");
        return;
    }
    this.execRoutines([routine]);
};

AbrEditor.prototype.execEventRoutines = function (eventName) {
    var routines = this.routines,
        eventRoutines = [];
    for (var key in routines) {
        if (routines.hasOwnProperty(key) && routines[key].events && routines[key].events.indexOf(eventName) > -1) {
            eventRoutines.push(routines[key]);
        }
    }
    if (eventRoutines.length === 0) {
        console.log("No routine found for " + eventName + " event");
        return false;
    }
    this.execRoutines(eventRoutines, true);
};

AbrEditor.prototype.defaultRoutines = function () {
    var that = this;
    return {
        imageAutoPreview:
        {
            events: ["cursorActivity"],
            condition: function () { return Abricotine.config.autoPreviewImages; },
            variables: {
                regex: /!\[(["'-a-zA-Z0-9@:%._\+~#=\.\/! ]*)\]\(([-a-zA-Z0-9@:%._\+~#=\.\/]+\.(jpg|jpeg|png|gif|svg))(\s("|')([-a-zA-Z0-9@:%._\+~#=\.\/! ]*)("|')\s?)?\)/gi,
                lineCallback: function (startPos, endPos, match) {
                    var alt = match[1],
                        url = match[2],
                        title= match[6];
                    return that.replaceImage(startPos, endPos, url, alt, title);
                }
            },
            loop: function (line) {
                that.replaceInLine(line, this.variables.regex, this.variables.lineCallback);
            }
        },
        autoPreviewTodo: // TODO: harmoniser le lexique checkbox/todo
        {
            events: ["cursorActivity"],
            condition: function () { return Abricotine.config.autoPreviewTodo; },
            variables: {
                regex: /^(\*|-|\+)\s+\[(x?)\]\s+/g,
                lineCallback: function (startPos, endPos, match) {
                    var isChecked = match[2] === "x";
                    return (function (startPos, endPos, isChecked) {
                        var from = startPos,
                            to = endPos;
                        var checkedClass = isChecked ? " checked" : "",
                            $element = $("<span class='checkbox" + checkedClass +"'></span>");
                        var element = $element.get(0),
                            doc = that.cm.doc,
                            textMarker = doc.markText(from, to, {
                                replacedWith: element,
                                clearOnEnter: false,
                                handleMouseEvents: false,
                                inclusiveLeft: true,
                                inclusiveRight: true
                            });
                        textMarker.on("beforeCursorEnter", function () {
                            if (!doc.somethingSelected()) { // Fix blink on selection
                                textMarker.clear();
                            }
                        });
                        $element.click( function () {
                            // Toggle
                            // TODO: func générique
                            var pos = textMarker.find(),
                                isChecked = $(this).hasClass("checked"),
                                newText = isChecked ? "* [] " : "* [x] ";
                            doc.replaceRange(newText, pos.from, pos.to);
                            $(this).toggleClass("checked");
                        });
                    })(startPos, endPos, isChecked);
                }
            },
            loop: function (line) {
                that.replaceInLine(line, this.variables.regex, this.variables.lineCallback);
            }
        },
        updateToc: {
            events: ["changes"],
            condition: function () { return true; },
            variables: {
                toc: []
            },
            beforeLoop: function () {
                this.variables.toc = [];
            },
            loop: function (line) {
                var lineNumber = that.cm.doc.getLineNumber(line),
                    state = that.getStateAt({line: lineNumber, ch: 1});
                if (state.header) {
                    this.variables.toc.push ({
                        content: line.text,
                        level: state.header,
                        line: lineNumber
                    });
                }
            },
            afterLoop: function () {
                Abricotine.setTocHtml(this.variables.toc);
            }
        }
    };
};

module.exports = AbrEditor;