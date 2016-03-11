/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var kramed = require("kramed");

// Add todolists support to kramed
var renderer = new kramed.Renderer();

renderer.listitem = function (text) {
    var newText = text.replace(/^\s*\[\s*(x?)\s*\]([^\n]*)$/i, function(match, checked, innerText, offset, string) {
        if (match == null) return "<li>" + string + "</li>";
        return "" +
        "<li class='task-list-item" + (checked ? " task-list-item-checked" : "") + "'>" +
            "<input class='task-list-item-checkbox' type='checkbox' disabled='disabled' " + (checked ? "checked='checked'" : "") + ">" +
            innerText +
        "</li>";
    });
    // No match
    if (newText === text) newText = "<li>" + text + "</li>";
    return newText;
};

function md2html(markdown) {
    return kramed(markdown, {renderer: renderer});
}

module.exports = md2html;
