/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

// Autopreview for CodeMirror

var path = require("path"),
    isUrl = require("is-url"),
    parsePath = require("parse-filepath");

function autopreview (cm, line, types) {

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
            if (!element) {
                continue;
            }
            markOptions.replacedWith = element;
            textMarker = doc.markText(from, to, markOptions);
            if (typeConfig.callback && typeof typeConfig.callback === "function" && textMarker && element) {
                typeConfig.callback(textMarker, element);
            }
        }
    }

    var doc = cm.doc,
        config = {
            image: {
                regex: /!\[([^\]]*)\]\(([\(\)\[\]-a-zA-Z0-9@:%_\+~#=\.\\\/ ]+\.(jpg|jpeg|png|gif|svg))(\s("|')([-a-zA-Z0-9@:%_\+~#=\.\/! ]*)("|')\s?)?\)/gi,
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
                    return $element.get(0);
                },
                marker: {
                    clearOnEnter: false,
                    handleMouseEvents: true,
                    inclusiveLeft: true,
                    inclusiveRight: true
                },
                callback: function (textMarker, element) {
                    var onclickFunc = function() {
                        var pos = textMarker.find().to;
                        textMarker.clear();
                        cm.doc.setCursor(pos);
                        cm.focus();
                    };
                    textMarker.on("beforeCursorEnter", function () {
                        if (!doc.somethingSelected()) { // Fix blink on selection
                            textMarker.clear();
                        }
                    });
                    element.addEventListener("load", function() {
                        textMarker.changed();
                    }, false);
                    element.onerror = function() {
                        $(element).replaceWith("<span class='autopreview-image image-error'></span>");
                        element.onclick = onclickFunc;
                        textMarker.changed();
                    };
                    element.onclick = onclickFunc;
                }
            },
            todolist: {
                regex: /^(\*|-|\+)\s+\[(\s*|x)?\]\s+/g,
                createElement: function (match) {
                    var isChecked = match[2] === "x",
                        checkedClass = isChecked ? " checked" : "",
                        $element = $("<span class='autopreview-todolist todolist" + checkedClass +"'></span>");
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
                            newText = isChecked ? "* [ ] " : "* [x] ";
                        doc.replaceRange(newText, pos.from, pos.to);
                        $(this).toggleClass("checked");
                    });
                }
            },
            iframe: {
                regex: /^\s*<iframe[^<>]*src=["'](https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%_\+~#=\.! ]*)[-a-zA-Z0-9@:%_\+~#=\.\/!?&; ]*)["'][^<>]*>\s*<\/iframe>\s*$/gi,
                createElement: function (match) {
                    function isAllowed(domain) {
                        if (cm.getOption("autopreviewSecurity") === false) {
                            return true;
                        }
                        var whitelist = cm.getOption("autopreviewAllowedDomains") || [];
                        for (var i=0; i<whitelist.length; i++) {
                            if (domain !== whitelist[i] && domain.slice(-(whitelist[i] + 1)) !== "." + whitelist[i]) {
                                continue;
                            }
                            return true;
                        }
                        return false;
                    }
                    var url = match[1],
                        domain = match[2].trim();
                    if (!isAllowed(domain)) {
                        return false;
                    }
                    // Preserve iframe aspect ratio: http://fettblog.eu/blog/2013/06/16/preserving-aspect-ratio-for-embedded-iframes/
                    var widthRegex = /width\s*(?:=|:)\s*(?:'|")?(\d+)(?!\s*%)(?:\s*px)?(?:'|"|\s|>)/i,
                        heightRegex = /height\s*(?:=|:)\s*(?:'|")?(\d+)(?!\s*%)(?:\s*px)?(?:'|"|\s|>)/i,
                        iframeWidth = match[0].match(widthRegex),
                        iframeHeight = match[0].match(heightRegex),
                        aspectRatio = iframeWidth && iframeHeight ? parseInt((iframeHeight[1] / iframeWidth[1]) * 100) : 56;
                    aspectRatio = aspectRatio > 100 ? 100 : aspectRatio;
                    // Create element
                    var $parent = $("<div class='autopreview-iframe' style='padding-bottom: " + aspectRatio + "%;'></div>"),
                        $webview = $("<webview frameborder='0' src='" + url + "'></webview>"),
                        errorFunc = function () {
                            $webview.remove();
                            $parent.addClass("iframe-error");
                        };
                    $webview.appendTo($parent);
                    $webview.on("did-fail-load", errorFunc);
                    $webview.on("did-start-loading", function () {
                        var timeoutDelay = 10000;
                        setTimeout(function() {
                            var webview = $webview.get(0);
                            if (webview && document.body.contains(webview) && webview.isWaitingForResponse()) {
                                webview.stop();
                                errorFunc() ;
                            }
                        }, timeoutDelay);
                    });
                    $webview.on("did-stop-loading", function () {
                        $parent.addClass("iframe-loaded");
                    });
                    return $parent.get(0);
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
                    element.onclick = function() {
                        if (!element.classList.contains("iframe-loaded")) {
                            var pos = textMarker.find().to;
                            textMarker.clear();
                            cm.doc.setCursor(pos);
                            cm.focus();
                        }
                    };
                }
            },
            anchor: {
                regex: /<a\s+name=["']([-a-zA-Z0-9@%_\+~#=!]+)["']\s*(\/>|>\s*<\/a>)/gi,
                createElement: function (match) {
                    var $element = $("<span class='anchor autopreview-anchor'><i class='fa fa-anchor'></i></span>");
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
                    var onMathLoaded = function () {
                        textMarker.changed();
                    };
                    window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, element], [onMathLoaded, undefined]);
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
    CodeMirror.defineOption("autopreviewSecurity", true);
    CodeMirror.defineOption("autopreviewAllowedDomains", []);
    CodeMirror.prototype.autopreview = function (line, types) {
        return autopreview (this, line, types);
    };
};
