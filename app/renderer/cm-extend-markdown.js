/* jshint esversion: 6 */
// TODO: support multiple selections
// TODO: reverse images and links
// TODO: reversible math => need to fix recognition of math delimiters as cm-formatting tokens
// FIXME: lists can also be "variable-3" and "keyword"

const styles = {
  italic: {
    classname: "em",
    type: "inline",
    set: "wrap",
    delimiter: "*",
    reversible: true
  },
  bold: {
    classname: "strong",
    type: "inline",
    set: "wrap",
    delimiter: "**",
    reversible: true
  },
  strikethrough: {
    classname: "strikethrough",
    type: "inline",
    set: "wrap",
    delimiter: "~~",
    reversible: true
  },
  code: {
    classname: "code", // FIXME: code?  comment? (formatting is not the same). See: https://github.com/codemirror/CodeMirror/blob/master/mode/markdown/markdown.js#L58
    type: "inline",
    set: "wrap",
    delimiter: "`",
    reversible: true
  },
  math: {
    type: "inline",
    classname: "m-stex",
    set: "wrap",
    delimiter: "$$"
  },
  image: {
    type: "inline",
    set: ({text, anchor, head}) => ["![", text, "(", anchor, "http://", head, ")"]
  },
  link: {
    type: "inline",
    set: ({text, anchor, head}) => {
      if (text.length === 0) {
        return ["[", anchor, text, head, "](http://)"];
      }
      return ["[", text, "](", anchor, "http://", head, ")"];
    }
  },
  anchor: {
    type: "inline",
    set: ({text, anchor, head}) => ["<a name=\"", anchor, text, head, "\"></a>"]
  },
  hr: {
    type: "inline",
    set: ({text, anchor, head}, cm) => {
      const posTo = cm.getCursor("to");
      if (text.length === 0 && posTo.ch === 0) {
        return ["***\n\n", anchor, head];
      }
      return [text, "\n\n***\n\n", anchor, head];
    }
  },
  codeblock: { // TODO: formatting: code-block (but not contents)
    type: "inline",
    set: ({text, anchor, head, delimiter}) => [delimiter, "\n", anchor, text, head, "\n", delimiter],
    delimiter: "```"
  },
  quote: {
    type: "block",
    classname: "quote",
    regex: /^(\s*)\>\s+/,
    prepend: "> "
  },
  ul: {
    type: "block",
    classname: function (cm, style) {
      const pos = cm.getCursor();
      const text = cm.getLine(pos.line);
      const regex = /^(\s*)(\*|\-|\+)\s(?!\[( |x)?\])/;
      if (regex.test(text)) return "variable-2";
    },
    regex: /^(\s*)(\*|\-|\+)\s+/,
    prepend: "* "
  },
  ol: {
    type: "block",
    classname: function (cm, style) {
      const pos = cm.getCursor();
      const text = cm.getLine(pos.line);
      if (style.regex.test(text)) return "variable-2";
    },
    regex: /^(\s*)\d+\.\s+/,
    prepend: ". ",
    prependDigit: true
  },
  todolist: {
    type: "block",
    classname: function (cm, style) {
      const pos = cm.getCursor();
      const text = cm.getLine(pos.line);
      if (style.regex.test(text)) return "variable-2";
    },
    regex: /^(\s*)(\*|\-|\+)\s+\[( |x)?\]\s+/,
    prepend: "- [ ] "
  },
  h1: {
    type: "block",
    classname: "header-1",
    level: 1,
    regex: /^(\s*)#\s+/,
    prepend: "# "
  },
  h2: {
    type: "block",
    classname: "header-2",
    level: 2,
    regex: /^(\s*)##\s+/,
    prepend: "## "
  },
  h3: {
    type: "block",
    classname: "header-3",
    level: 3,
    regex: /^(\s*)###\s+/,
    prepend: "### "
  },
  h4: {
    type: "block",
    classname: "header-4",
    level: 4,
    regex: /^(\s*)####\s+/,
    prepend: "#### "
  },
  h5: {
    type: "block",
    classname: "header-5",
    level: 5,
    regex: /^(\s*)#####\s+/,
    prepend: "##### "
  },
  h6: {
    type: "block",
    classname: "header-6",
    level: 6,
    regex: /^(\s*)######\s+/,
    prepend: "###### "
  }
};

const addon = {
  // TODO: compatibility fix => remove draw() when 100% done
  draw: function (name) {
    return this.toggle.bind(this)(name);
  },

  toggle: function (name) {
    const getState = (pos = this.getCursor("start")) => {
      const type = this.getTokenTypeAt(pos);
      if (!type) return [];
      const classnames = type.split(" ");
      return classnames;
    };

    const getClassname = (style) => {
      const hint = style.classname;
      if (typeof hint === "function") {
        return hint(this, style);
      }
      return hint;
    };

    const isApplied = (classnames, style) => {
      const isMatch = (name) => classnames.indexOf(name) > -1;
      const classname = getClassname(style);
      return isMatch(classname);
    };

    const removeInlineStyle = (style) => {
      const getDelimiter = (pos, classname, step) => {
        const getNextMove = (pos, step) => {
          const lineLength = this.getLine(pos.line).length;
          const chStep = pos.ch + step;
          const isOutOfLine = chStep < 0 || chStep > lineLength;
          if (isOutOfLine) {
            const firstLine = this.firstLine();
            const lastLine = this.lastLine();
            const lineStep = pos.line + step;
            const isOutOfEditor = lineStep < firstLine || lineStep > lastLine;
            if (isOutOfEditor) return null;
            return {
              line: lineStep,
              ch: step > 0 ? 0 : this.getLine(lineStep).length
            };
          }
          return {
            line: pos.line,
            ch: chStep
          };
        };

        let move = {
          line: pos.line,
          ch: step > 0 ? pos.ch + 1 : pos.ch
        };
        while (move) {
          const type = this.getTokenTypeAt(move) || [];
          if (type.split(" ").includes(`formatting-${classname}`)) {
            move.ch--;
            return move;
          }
          move = getNextMove(move, step);
        }
      };

      const cursorFrom = this.getCursor("from");
      const cursorTo = this.getCursor("to");
      const classname = getClassname(style);
      const prevDelimiter = getDelimiter(cursorFrom, classname, -1);
      const nextDelimiter = getDelimiter(cursorTo, classname, 1);
      if (!prevDelimiter || !nextDelimiter) return;

      // Get text
      const delimiterLength = style.delimiter.length;
      const insideFrom = Object.assign({}, prevDelimiter);
      const insideTo = Object.assign({}, nextDelimiter);
      insideFrom.ch++;
      const text = this.getRange(insideFrom, insideTo);

      // Replace text (without delimiters)
      const outsideFrom = Object.assign({}, insideFrom);
      const outsideTo = Object.assign({}, insideTo);
      outsideFrom.ch -= delimiterLength;
      outsideTo.ch += delimiterLength;
      this.replaceRange(text, outsideFrom, outsideTo);

      // Select new text
      const selFrom = Object.assign({}, outsideFrom);
      const selTo = Object.assign({}, insideTo);
      if (selFrom.line === selTo.line) {
        selTo.ch -= delimiterLength;
      }
      this.setSelection(selFrom, selTo);
    };

    const countNewLines = (str) => {
      const match = str.match(/\n/g);
      const newLines = match ? match.length : 0;
      return newLines;
    };

    const getLastLineLength = (start, str) => {
      const newLinePos = str.lastIndexOf("\n");
      if (newLinePos === -1) return start.ch + str.length;
      return str.length - str.lastIndexOf("\n") - 1;
    };

    const addInlineStyle = (style) => {
      const getSetFunc = (style) => {
        if (style.set === "wrap") {
          return ({text, anchor, head, delimiter}) => [delimiter, anchor, text, head, delimiter];
        }
        if (typeof style.set !== "function") {
          throw Error("style.set is not a function");
        }
        return style.set;
      };

      const getTrimmedText = () => {
        const getMatchesNb = (text, regex) => {
          return (text.match(regex) || [""])[0].length;
        };
        const text = this.getSelection();
        const nbSpacesBefore = getMatchesNb(text, /^\s+/);
        const nbSpacesAfter = getMatchesNb(text, /\s+$/);
        if (nbSpacesBefore === 0 && nbSpacesAfter === 0) return text;
        const start = this.getCursor("from");
        const end = this.getCursor("to");
        start.ch += nbSpacesBefore;
        end.ch -= nbSpacesAfter;
        this.setSelection(start, end);
        return this.getRange(start, end);
      };

      const setFunc = getSetFunc(style);
      const text = getTrimmedText();
      const anchor = Symbol("anchor");
      const head = Symbol("head");
      const delimiter = style.delimiter;
      const template = setFunc({text, anchor, head, delimiter}, this);
      const selection = {};

      const getCurrentPosition = (sum) => {
        const newLines = countNewLines(sum);
        // TODO: get those values once and for all
        const start = this.getCursor("start");
        const lastLineLength = getLastLineLength(start, sum);
        return {
          line: start.line + newLines,
          ch: lastLineLength
        };
      };

      const newText = template.reduce((sum, el) => {
        if (typeof el === "string") {
          return sum + el;
        }
        if (el === anchor) {
          selection.anchor = getCurrentPosition(sum);
        } else if (el === head) {
          selection.head = getCurrentPosition(sum);
        }
        return sum;
      }, "");

      this.doc.replaceSelection(newText);
      this.setSelection(selection.anchor, selection.head);
    };

    const toggleInline = (style) => {
      const classnames = getState();
      const styleIsApplied = isApplied(classnames, style);
      if (styleIsApplied) {
        removeInlineStyle(style);
      } else {
        addInlineStyle(style);
      }
    };

    const toggleBlock = (style) => {
      const setLine = (line, text) => {
        const start = {line, ch: 0};
        const end = {line};
        this.replaceRange(text, start, end, "+setLine");
      };

      const start = this.getCursor("start");
      const end = this.getCursor("end");
      // FIXME: use a consistent varname for "state" everywhere
      const state = getState();
      const classname = getClassname(style);
      const alreadyHasThisType = state.includes(classname);

      const clearTypes = (state, text) => {
        Object.keys(styles).forEach((key) => {
          const style = styles[key];
          if (style.type !== "block") return;
          const styleIsApplied = isApplied(state, style);
          if (styleIsApplied) {
            text = text.replace(style.regex, "$1");
          }
        });
        return text;
      };

      const doc = this.doc;
      let count = 0;
      doc.eachLine(start.line, end.line + 1, (line) => {
        const lineNumber = doc.getLineNumber(line);
        let text = line.text;
        text = clearTypes(state, text);
        if (!alreadyHasThisType) {
          text = style.prepend + text;
          if (style.prependDigit) {
            count++;
            text = count + text;
          }
        }
        setLine(lineNumber, text);
      });

      // Update selection
      if (start.line !== end.line || start.ch !== end.ch) {
        this.setSelection({ch: 0, line: start.line}, {line: end.line});
      }
    };

    const style = styles[name];
    if (style == null) {
      throw Error(`Can't find style '${name}'`);
    }
    const fn = style.type === "inline" ? toggleInline : toggleBlock;
    return fn(style);
  }
};

module.exports = function (CodeMirror) {
  Object.assign(CodeMirror.prototype, addon);
};
