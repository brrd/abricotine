/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var AbrDocument = require("./abr-document.js");

$( function () {
    var abrDoc = new AbrDocument();
    window.abrDoc = abrDoc;
});
