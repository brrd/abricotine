/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var cp = require("child_process"),
    svd = require('simple-virtual-dom'),
    el = svd.el,
    diff = svd.diff,
    patch = svd.patch;

function setTocHtml (abrPane, toc) {
    var newTree = renderTree(toc);
    var patches = diff(abrPane.tree, newTree);
    patch(abrPane.node, patches);
    abrPane.tree = newTree;
}

function setActiveHeaderHtml (abrPane, index) {
    var $activeHeader = $("#toc-container li").eq(index);
    if ($activeHeader && !$activeHeader.hasClass("pane-active")) {
        $("#toc-container li.pane-active").removeClass("pane-active");
        $activeHeader.addClass("pane-active");
    }
    abrPane.latestCursorUpdate = abrPane.abrDoc.getGeneration();
}

function renderTree (toc) {
    var children = [];
    if (!toc) return el("ul", {id: "toc-container"});
    toc.forEach(function (header, index) {
        var li = el("li", {
                    "class": "toc-h" + header.level,
                    "data-abricotine-gotoline": header.line,
                    "key": "ul" + index
                },
                [el("a", [header.content])]
            );
        children.push(li);
    });
    return el("ul", {id: "toc-container"}, children);
}

function AbrPane (abrDoc) {
    this.abrDoc = abrDoc;
    var cm = abrDoc.cm;

    // Init UI
    $("#pane").on("click", "li", function () {
        var line = parseInt($(this).attr('data-abricotine-gotoline')),
            doc = cm.doc,
            height = cm.getScrollInfo().clientHeight,
            top = cm.heightAtLine(line, "local"),
            marginTop = 10;
        doc.setCursor({
            line: line,
            ch: null
        });
        // Scoll to show target at the top of the window
        cm.scrollIntoView({
            top: top - marginTop,
            bottom: top + height - marginTop,
            left: 0,
            right: 0
        });
        cm.focus();
    });

    // Generate an empty tree on startup
    this.tree = el("ul", {id: "toc-container"});
    this.node = this.tree.render();
    $("#pane").append(this.node);

    // Events
    var that = this;
    // Run this in a background thread
    var worker = cp.fork(__dirname + "/abr-pane-worker.js");

    cm.on("cursorActivity", function (cm) {
        // Trigger only if nothing changed (otherwise do it during the "changes" event)
        if (that.latestCursorUpdate == null || that.abrDoc.getGeneration() === that.latestCursorUpdate) {
            var cursorLine = cm.doc.getCursor().line;
            // Also dont trigger if cursor is still on the same line
            if (cursorLine === that.currentCursorLine) return;
            that.currentCursorLine = cursorLine;
            worker.send({
                cursorLine: cursorLine
            });
        }
    });

    cm.on("changes", function (cm, changeObj) {
        var cursorLine = cm.doc.getCursor().line;
        worker.send({
            text: cm.getValue(),
            cursorLine: cursorLine
        });
    });

    worker.on("message", function(msg) {
        if (msg.toc) {
            setTocHtml(that, msg.toc);
        }
        if (msg.activeHeaderIndex != null) {
            setActiveHeaderHtml(that, msg.activeHeaderIndex);
        }
    }, false);
}

AbrPane.prototype = {
    // Is pane visible
    isVisible: function () {
        return $('body').hasClass('pane-visible');
    }
};

module.exports = AbrPane;
