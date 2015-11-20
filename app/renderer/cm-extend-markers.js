/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

// Markers management functions for CodeMirror

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
    var markers = getMarkers(cm, selector);
    for (var i=0; i<markers.length; i++) {
        markers[i].clear();
    }
    cm.refresh();
}

module.exports = function (CodeMirror) {
    CodeMirror.prototype.getMarkers = function (selector) {
        return getMarkers(this, selector);
    };
    CodeMirror.prototype.clearMarkers = function (selector) {
        return clearMarkers(this, selector);
    };
};
