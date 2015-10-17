/*
    Markdown functions for CodeMirror
    ==========
    Inspiration : https://github.com/airpub/ninja
*/

/**
*
* The state of CodeMirror at the given position.
*
*/
function getState (cm, pos) {
    pos = pos || cm.getCursor('start');
    var stat = cm.getTokenAt(pos);
    if (!stat.type) {
        return {};
    }
    var types = stat.type.split(' ');
    var ret = {}, data, text;
    for (var i = 0; i < types.length; i++) {
        switch (types[i]) {
            case 'strong':
                ret.bold = true;
                break;
            case 'quote':
                ret.quote = true;
                break;
            case 'em':
                ret.italic = true;
                break;
            case 'link':
                ret.link = true;
                break;
            case 'variable-2':
                text = cm.getLine(pos.line);
                if (/^\s*\d+\.\s/.test(text)) {
                    ret['ordered-list'] = true;
                } else if (/^\s*(\*|\-|\+)\s+\[x?\]\s/.test(text)) {
                    ret['todo-list'] = true;
                } else {
                    ret['unordered-list'] = true;
                }
                break;
            case 'header-1':
                ret.h1 = true;
                ret.header = 1;
                break;
            case 'header-2':
                ret.h2 = true;
                ret.header = 2;
                break;
            case 'header-3':
                ret.h3 = true;
                ret.header = 3;
                break;
            case 'header-4':
                ret.h4 = true;
                ret.header = 4;
                break;
            case 'header-5':
                ret.h5 = true;
                ret.header = 5;
                break;
            case 'header-6':
                ret.h6 = true;
                ret.header = 6;
                break;
            case 'string':
                ret.string = true;
                break;
            case 'comment':
                ret.code = true;
                break;
            case 'strikethrough':
                ret.strikethrough = true;
                break;
            default:
                break;
        }
    }
    return ret;
}

/**
*
* inject text into current Pos
*
* @param {[Array]} [texts]
*
**/
function inject (cm, texts, triggered) {
    if (!cm) {
        return;
    }
    var startPoint = cm.getCursor('start');
    var endPoint = cm.getCursor('end');
    var text = cm.getSelection();
    // todo: toggle link/image
    cm.replaceSelection(
        texts.length > 1 ?
        texts[0] + text + texts[1] :
        text + texts.join()
    );
    if (texts.length > 1) {
        var newLines = texts[0].match('/n');
        if (newLines) {
            var lastLineLength = texts[0] - texts[0].lastIndexOf('/n');
            startPoint.line += newLines.length;
            endPoint.line += newLines.length;
            startPoint.ch = lastLineLength;
            endPoint.ch = lastLineLength;
        } else {
            startPoint.ch += texts[0].length;
            endPoint.ch += texts[0].length;
        }
    }
    cm.setSelection(startPoint, endPoint);
    cm.focus();
}

function setLine (line, text, cm) {
    var lineStart = {
        line: line,
        ch: 0
    };
    var lineEnd = {
        line: line
    };
    cm.replaceRange(text, lineStart, lineEnd);
}

/**
*
* Toggle whatever you like
*
* @status: enabled
* @example
*   toggle('bold');
*   toggle('italic');
*   toggle('quote');
*   toggle('unordered-list');
*   toggle('ordered-list');
*   toggle('fullscreen');
*
**/
function toggle (type) {
    /**
    *
    * Toggle a line to selected block style
    *
    * @status: enabled
    * @example
    *   toggle('quote');
    *   toggle('ordered-list');
    *   toggle('unordered-list');
    *
    **/
    function toggleBlock(type, cm) {
        var stat = getState(cm);
        var startPoint = cm.getCursor('start');
        var endPoint = cm.getCursor('end');
        var count = 1;
        var gap = endPoint.line - startPoint.line;
        var styleMap = {
            'quote': {
                re: /^(\s*)\>\s+/,
                prepend: '> '
            },
            'unordered-list': {
                re: /^(\s*)(\*|\-|\+)\s+/,
                prepend: '* '
            },
            'ordered-list': {
                re: /^(\s*)\d+\.\s+/,
                prepend: '. '
            },
            'todo-list': {
                re: /^(\s*)(\*|\-|\+)\s+\[x?\]\s+/,
                prepend: '* [] '
            },
            'h1': {
                re: /^(\s*)#\s+/,
                prepend: '# '
            },
            'h2': {
                re: /^(\s*)##\s+/,
                prepend: '## '
            },
            'h3': {
                re: /^(\s*)###\s+/,
                prepend: '### '
            },
            'h4': {
                re: /^(\s*)####\s+/,
                prepend: '#### '
            },
            'h5': {
                re: /^(\s*)#####\s+/,
                prepend: '##### '
            },
            'h6': {
                re: /^(\s*)######\s+/,
                prepend: '###### '
            }
        };
        var style = styleMap[type];
        for (var i = startPoint.line; i <= endPoint.line; i++) {
            var text = cm.getLine(i);

            var olderTypes = Object.keys(stat);
            var hasTypeBefore = olderTypes.length > 0 && type !== olderTypes[0];

            if (hasTypeBefore && styleMap[olderTypes[0]]) {
                text = text.replace(styleMap[olderTypes[0]].re, '$1');
            }

            if (stat[type]) {
                text = text.replace(style.re, '$1'); // FIXME: absurde car $1 === " " ???
            } else {
                if (type === 'ordered-list') {
                    // count how many line we want to add order.
                    if (gap !== 0) {
                        text = count + style.prepend + text;
                        count ++;
                    } else {
                        text = 1 + style.prepend + text;
                    }
                } else {
                    text = style.prepend + text;
                }
            }
            setLine(i, text, cm);
        }
        cm.focus();
    }

    /**
    *
    * Toggle a wrappered text to selected style.
    *
    * @status: enabled
    * @example
    *   toggleText('bold') => fn(cm);
    *   toggleText('italic') => fn(cm);
    *
    **/
    function toggleText(type) {

        function toggleTextByStyle(cm) {
            var style = styleMap[type];
            var stat = getState(cm);
            var text;

            var start = style.start;
            var end = style.end;

            var startPoint = cm.getCursor('start');
            var endPoint = cm.getCursor('end');

            if (stat[type]) {
                text = cm.getLine(startPoint.line);
                start = text.slice(0, startPoint.ch);
                end = text.slice(startPoint.ch);

                start = start.replace(style.re.start, '$1$3');
                end = end.replace(style.re.end, '$1$3');

                startPoint.ch -= style.offset;
                endPoint.ch -= style.offset;

                setLine(startPoint.line, start + end, cm);
            } else {
                text = cm.getSelection();
                cm.replaceSelection(start + text + end);

                startPoint.ch += style.offset;
                endPoint.ch += style.offset;
            }
            cm.setSelection(startPoint, endPoint);
            cm.focus();
        }

        var styleMap = {
            bold: {
                start: '**',
                end: '**',
                re: {
                    start: /^(.*)?(\*|\_){2}(\S+.*)?$/,
                    end: /^(.*\S+)?(\*|\_){2}(\s+.*)?$/
                },
                offset: 2
            },
            italic: {
                start: '*',
                end: '*',
                re: {
                    start: /^(.*)?(\*|\_)(\S+.*)?$/,
                    end: /^(.*\S+)?(\*|\_)(\s+.*)?$/
                },
                offset: 1
            },
            strikethrough: {
                start: '~~',
                end: '~~',
                re: {
                    start: /^(.*)?(~){2}(\S+.*)?$/,
                    end: /^(.*\S+)?(~){2}(\s+.*)?$/
                },
                offset: 2
            },
            code: {
                start: '`',
                end: '`',
                re: {
                    start: /^(.*)?(`)(\S+.*)?$/,
                    end: /^(.*\S+)?(`)(\s+.*)?$/
                },
                offset: 1
            }
        };
        return toggleTextByStyle;
    }

    function toggleWhatever(cm) {
        if (!cm) {
            console.log("cm is not defined");
            return;
        } else if (toggleTextList.indexOf(type) > -1) {
            return toggleText(type)(cm);
        } else {
            return toggleBlock(type, cm);
        }
    }
    var toggleTextList = ['bold', 'italic', 'strikethrough', 'code'];
    return toggleWhatever;
}

/**
*
* Draw something, and wrap current cursor.
*
* @example
*   draw('link'); => [<cursor>](http://)
*   draw('image'); => ![<cursor>](http://)
*
**/
function draw(type, url) {
    function drawWhatever(cm) {
        var stat = getState(cm);
        inject(cm, placeholders[type], stat[type]);
    }
    url = url || "http://";
    var placeholders = {
        link: ['[', '](' + url + ')'],
        image: ['![', '](' + url + ')'],
        hr: ['\n***\n'],
        inlineMath: ["$$$", "$$$"],
        displayMath: ["$$", "$$"]
    };
    // TODO: ajouter blockcode, éventuellement par langage. Le problème c'est que c'est forcément des paragraphes donc il faut détecter si on saute des lignes ou non. RQ: c'est ce qu'il aurait déjà fallu faire pour hr.
    return drawWhatever;
}

module.exports = function (CodeMirror) {
    CodeMirror.prototype.getState = function (pos) {
        return getState(this, pos);
    };
    CodeMirror.prototype.inject = function (texts, triggered) {
        return inject (this, texts, triggered);
    };
    CodeMirror.prototype.setLine = function (line, text) {
        return setLine (line, text, this);
    };
    CodeMirror.prototype.toggle = function (type) {
        return toggle(type)(this); // TODO: reverse theses functions
    };
    CodeMirror.prototype.draw = function (type,param) {
        return draw(type, param)(this); // TODO: reverse theses functions
    };
};
