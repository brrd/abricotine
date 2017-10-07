/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

/* jshint esversion: 6 */

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
    classname: "comment",
    delimiterClassname: "code",
    type: "inline",
    set: "wrap",
    delimiter: "`",
    reversible: true
  },
  math: {
    type: "inline",
    classname: "m-stex",
    delimiterClassname: "math",
    set: "wrap",
    delimiter: "$",
    reversible: true
  },
  displaymath: {
    type: "inline",
    classname: "m-stex",
    delimiterClassname: "displaymath",
    set: "wrap",
    delimiter: "$$",
    reversible: true
  },
  image: {
    type: "inline",
    classname: "image",
    set: ({text, anchor, head}) => ["![", text, "](", anchor, "http://", head, ")"]
  },
  link: { // TODO: delete links
    type: "inline",
    classname: "link",
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
  codeblock: {
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
      const regex = /^(\s*)(\*|\-|\+)(?!\s\[( |x)?\])\s+/;
      if (regex.test(text)) return "list";
    },
    regex: /^(\s*)(\*|\-|\+)\s+/,
    prepend: "* "
  },
  ol: {
    type: "block",
    classname: function (cm, style) {
      const pos = cm.getCursor();
      const text = cm.getLine(pos.line);
      if (style.regex.test(text)) return "list";
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
      if (style.regex.test(text)) return "list";
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

module.exports = styles;
