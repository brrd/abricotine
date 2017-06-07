/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

var svd = require('simple-virtual-dom'),
    el = svd.el,
    diff = svd.diff,
    patch = svd.patch;

function renderTree (toc) {
    var children = [];
    if (!toc) return el("ul", {id: "toc-container"});
    toc.forEach(function (header, index) {
        var li = el("li", {
                    "class": "toc-h" + header.level,
                    "data-abricotine-header-index": index,
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
    this.lineNumbers = [];
    var cm = abrDoc.cm;

    // Init UI
    $("#pane-title").text(abrDoc.localizer.get("pane-table-of-contents"));

    $("#pane").on("click", "li", function () {
        var index = parseInt($(this).attr("data-abricotine-header-index")),
            line = that.lineNumbers[index],
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
}

AbrPane.prototype = {
    setLineNumbers: function(lineNumbers) {
      this.lineNumbers = lineNumbers;
    },

    setTocHtml: function(toc) {
      var newTree = renderTree(toc);
      var patches = diff(this.tree, newTree);
      patch(this.node, patches);
      this.tree = newTree;
    },

    setActiveHeaderHtml: function(index) {
      var $activeHeader = $('#toc-container li').eq(index);
      if ($activeHeader && !$activeHeader.hasClass('pane-active')) {
        $('#toc-container li.pane-active').removeClass('pane-active');
        $activeHeader.addClass('pane-active');
      }

      this.latestCursorUpdate = this.abrDoc.getGeneration();
    },

    // Is pane visible
    isVisible: function () {
        return $('body').hasClass('pane-visible');
    }
};

module.exports = AbrPane;
