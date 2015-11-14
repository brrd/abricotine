var path = require("path"),
    isUrl = require("is-url"),
    parsePath = require("parse-filepath");

function preview (cm, line, types) {

    function lineIsSelected (lineNumber) {
        // FIXME: doesnt work in case of multiple selection
        var cursor = {
            begin: doc.getCursor("from"),
            end: doc.getCursor("to")
        };
        return !(cursor.begin.line > lineNumber || cursor.end.line < lineNumber);
    }

    function replaceInLine (line, typeConfig) {
        var lineNumber,
            regex = typeConfig.regex,
            match,
            from,
            to,
            element,
            markOptions = typeConfig.marker,
            textMarker;
        if (typeof line === 'number') {
            lineNumber = line;
            line = doc.getLineHandle(line);
        } else {
            lineNumber = doc.getLineNumber(line);
        }
        if (lineIsSelected(lineNumber)){ return; }
        while ((match = regex.exec(line.text)) !== null) {
            from = {
                line: lineNumber,
                ch: match.index
            };
            to = {
                line: lineNumber,
                ch: from.ch + match[0].length
            };
            if (doc.findMarks(from, to).length > 0) {
                continue;
            }
            element = typeConfig.createElement(match);
            markOptions.replacedWith = element;
            textMarker = doc.markText(from, to, markOptions);
            if (typeConfig.callback && typeof typeConfig.callback === "function") {
                typeConfig.callback(textMarker, element);
            }
        }
    }

    var doc = cm.doc,
        config = {
            image: {
                regex: /!\[(["'-a-zA-Z0-9@:%._\+~#=\.\/! ]*)\]\(([\(\)\[\]-a-zA-Z0-9@:%_\+~#=\.\/ ]+\.(jpg|jpeg|png|gif|svg))(\s("|')([-a-zA-Z0-9@:%_\+~#=\.\/! ]*)("|')\s?)?\)/gi,
                createElement: function (match) {
                    function getImageUrl (href) {
                        if (isUrl(href)) {
                            return href;
                        }
                        var parsedPath = parsePath(href);
                        if (parsedPath.isAbsolute) {
                            return parsedPath.absolute;
                        } else {
                            return path.join(process.cwd(), href);
                        }
                    }
                    var alt = match[1] || '',
                        url = getImageUrl(match[2]),
                        title = match[6],
                        $element = $("<img class='autopreview-image'>").attr("src", url).attr("alt", alt);
                    if (title) {
                        $element.attr("title", title);
                    }
                    $element.error( function() {
                        $(this).replaceWith("<span class='autopreview-error'>Image not found: " + url + "</span>");
                    });
                    return $element.get(0);
                },
                marker: {
                    clearOnEnter: false,
                    handleMouseEvents: true,
                    inclusiveLeft: true,
                    inclusiveRight: true
                },
                callback: function (textMarker, element) {
                    textMarker.on("beforeCursorEnter", function () {
                        if (!doc.somethingSelected()) { // Fix blink on selection
                            textMarker.clear();
                        }
                    });
                }
            },
            // TODO: rename this in "todo"
            checkbox: {
                regex: /^(\*|-|\+)\s+\[(\s*|x)?\]\s+/g,
                createElement: function (match) {
                    var isChecked = match[2] === "x",
                        checkedClass = isChecked ? " checked" : "",
                        $element = $("<span class='autopreview-checkbox checkbox" + checkedClass +"'></span>");
                    return $element.get(0);
                },
                marker: {
                    clearOnEnter: true,
                    handleMouseEvents: false,
                    inclusiveLeft: true,
                    inclusiveRight: true
                },
                callback: function (textMarker, element) {
                    var $element = $(element);
                    $element.click( function () {
                        var pos = textMarker.find(),
                            isChecked = $(this).hasClass("checked"),
                            newText = isChecked ? "* [] " : "* [x] ";
                        doc.replaceRange(newText, pos.from, pos.to);
                        $(this).toggleClass("checked");
                    });
                }
            },
            iframe: {
                regex: /^\s*<iframe[^<>]*src=["']https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%_\+~#=\.! ]*)[-a-zA-Z0-9@:%_\+~#=\.\/! ]*["'][^<>]*>\s*<\/iframe>\s*$/gi,
                createElement: function (match) {
                    var whitelist = ["youtube.com", "google.com"], // TODO: config + add others
                        url = match[1],
                        allowed = false;
                    for (var i=0; i<whitelist.length; i++) {
                        if (url.trim() !== whitelist[i]) {
                            continue;
                        }
                        return $(match[0]).addClass("autopreview-iframe").get(0); // TODO: maybe better/safer to reprocess an iframe from scratch ?
                    }
                },
                marker: {
                    clearOnEnter: false,
                    inclusiveLeft: false,
                    inclusiveRight: false
                },
                callback: function (textMarker, element) {
                    textMarker.on("beforeCursorEnter", function () {
                        if (!doc.somethingSelected()) { // Fix blink on selection
                            textMarker.clear();
                        }
                    });
                }
            },
            anchor: {
                regex: /<a\s+name=["']([-a-zA-Z0-9@%_\+~#=!]+)["']\s*(\/>|>\s*<\/a>)/gi,
                createElement: function (match) {
                    var name = match[1],
                        $element = $("<a class='anchor autopreview-anchor' name='" + name + "' title='Anchor: " + name + "'></a>");
                    return $element.get(0);
                },
                marker: {
                    clearOnEnter: true,
                    handleMouseEvents: true,
                    inclusiveLeft: true,
                    inclusiveRight: true
                }
            },
            math: {
                regex: /\${2}[^$]+\${2}/gi,
                createElement: function (match) {
                    var $element = $("<span class='math autopreview-math'>" + match[0] + "</span>");
                    return $element.get(0);
                },
                marker: {
                    clearOnEnter: false,
                    handleMouseEvents: true,
                    inclusiveLeft: true,
                    inclusiveRight: true
                },
                callback: function (textMarker, element) {
                    window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, element]);
                    textMarker.on("beforeCursorEnter", function () {
                        if (!doc.somethingSelected()) { // Fix blink on selection
                            textMarker.clear();
                        }
                    });
                }
            }
        };
    if (types === undefined || types.length === 0) {
        return;
    }
    for (var type in types) {
        if (types[type] === true && config[type]) {
            replaceInLine(line, config[type]);
        }
    }
}

module.exports = function (CodeMirror) {
    CodeMirror.prototype.preview = function (line, types) {
        return preview (this, line, types);
    };
};
