function getMarkers (cm, selector) {
    var doc = cm.doc,
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
}

function clearMarkers (cm, selector) {
    var doc = cm.doc,
        markers = getMarkers(cm, selector);
    for (var i=0; i<markers.length; i++) {
        markers[i].clear();
    }
}

module.exports = function (CodeMirror) {
    CodeMirror.prototype.getMarkers = function (selector) {
        return getMarkers(this, selector);
    };
    CodeMirror.prototype.clearMarkers = function (selector) {
        return clearMarkers(this, selector);
    };
};
