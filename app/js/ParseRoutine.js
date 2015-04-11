function ParseRoutine (args) {
    this.name = args.name;
    this.context = args.context || {};
    this.prepare = args.prepare && typeof args.prepare === 'function' ? args.prepare : undefined;
    this.eachLine = args.eachLine && typeof args.eachLine === 'function' ? args.eachLine : undefined;
    this.callback = args.callback && typeof args.callback === 'function' ? args.callback : undefined;
    this.abrEditor = undefined;
}

// TODO: faire dans l'autre sens : c'est l'editor qui attache. Du coup pas sûr qu'il faille un objet consacré.
ParseRoutine.prototype.attachTo = function (eventName, abrEditor) {
    if (!abrEditor.parseRoutines[eventName]) {
        abrEditor.parseRoutines[eventName] = [];
    }
    abrEditor.parseRoutines[eventName].push(this);
    this.abrEditor = abrEditor;
};

module.exports = ParseRoutine;