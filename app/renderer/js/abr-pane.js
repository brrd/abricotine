function AbrPane (abrDoc) {
    this.abrDoc = abrDoc;
    var cm = abrDoc.cm;
    // ToC links
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
    // Events
    var that = this;
    cm.on("cursorActivity", function (cm) {
        // Trigger spyCursor() now only if nothing changed (otherwise do it later, during changes event)
        if (typeof that.abrDoc.latestSpyCursorUpdate === "undefined" || that.abrDoc.getGeneration() === that.abrDoc.latestSpyCursorUpdate) {
            that.spyCursor();
        }
    });
    cm.on("changes", function (cm, changeObj) {
        that.updateToc();
        that.spyCursor();
    });
}

AbrPane.prototype = {

    // Is pane visible
    isVisible: function () {
        return $('body').hasClass('pane-visible');
    },

    // Update table of content
    updateToc: function () {
        var cm = this.abrDoc.cm,
            toc = [],
            prevLine;
        cm.doc.eachLine( function (line) {
            var lineNumber = cm.doc.getLineNumber(line),
                state = cm.getState({line: lineNumber, ch: 1});
            if (state.header) {
                // Handle underlined headers
                if ((state.h1 || state.h2) && /^(=|-)+$/.test(line.text.trim())) {
                    toc.push ({
                        content: prevLine.text,
                        level: state.header,
                        line: lineNumber - 1
                    });
                } else {
                    var text = line.text.match(/^#+\s(.*)$/);
                    text = text && text[1] ? text[1] : line.text;
                    toc.push ({
                        content: text,
                        level: state.header,
                        line: lineNumber
                    });
                }
            }
            prevLine = line;
        });
        this.setTocHtml(toc);
    },

    setTocHtml: function (toc) {
        var html = "";
        for (var i=0; i<toc.length; i++) {
            html += '\n<li class="toc-h' + toc[i].level + '" data-abricotine-gotoline="' + toc[i].line + '"><a>' + toc[i].content + '</a></li>';
        }
        $('#pane ul#toc-container').html(html);
    },

    // Cursorspy (like scrollspy but with cursor)
    spyCursor: function () {
        var cm = this.abrDoc.cm,
            currentLine = cm.doc.getCursor().line,
            $prevHeaderLi = (function(line) {
                var $header;
                $("#toc-container li").each(function() {
                    var linkedLine = $(this).attr("data-abricotine-gotoline");
                    if (linkedLine !== undefined && linkedLine <= line) {
                        $header = $(this);
                    } else {
                        return false; // break
                    }
                });
                return $header;
            })(currentLine);
        if ($prevHeaderLi && !$prevHeaderLi.hasClass("pane-active")) {
            $("#toc-container li.pane-active").removeClass("pane-active");
            $prevHeaderLi.addClass("pane-active");
        }
        window.abrDoc.latestSpyCursorUpdate = window.abrDoc.getGeneration();
    }
};

module.exports = AbrPane;
