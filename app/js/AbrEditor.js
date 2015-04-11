// Wrapper CodeMirror    
// C'est ici qu'on a les fonctions ital, bold, etc.
// Most of the methods are aliases to CodeMirror functions

var md4cm = loadComponent('md4cm');

function AbrEditor (abrDocument) {
    this.init();
    this.abrDocument = abrDocument;
    this.parseRoutines = {};
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

AbrEditor.prototype.execParseRoutines = function (eventName) {
    function eachRoutine (routines, methodName, args) {
        var routine,
            result;
        for (var i=0; i<routines.length; i++) {
            routine = routines[i];
            if (typeof routine[methodName] === "function") {
                result = routine[methodName](args);  
                routine.context = result || routine.context;
            }
        }
    }
    var routines = this.parseRoutines[eventName],
        doc = this.cm.doc;
    if (!routines) {
        console.log("No parseRoutines found for " + eventName + " event");
        return false;
    }
    eachRoutine(routines, 'prepare');
    doc.eachLine( function (line) {
        var args = {
            line: line,
            lineNumber: doc.getLineNumber(line)
        };
        eachRoutine(routines, 'eachLine', args);
    });
    eachRoutine(routines, 'callback');
};

module.exports = AbrEditor;