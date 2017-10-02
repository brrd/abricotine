/* jshint esversion: 6 */
module.exports = function (CodeMirror) {
    CodeMirror.commands.homeList = function (cm) {
        const pos = cm.getCursor();
        const eolTokenType = cm.getTokenTypeAt({line: pos.line});
        const inList = /(variable-(2|3)|keyword)/.test(eolTokenType);
        const line = cm.getLine(pos.line);
        const bulletRegex = /^(\s*(?:\*|\-|\+)(?:\s+\[(?: |x)?\])?\s)/;
        const textBeforeCursor = line.slice(0, pos.ch);
        const cursorAfterBullet = bulletRegex.test(textBeforeCursor);

        if (!inList || !cursorAfterBullet) {
          return cm.execCommand("goLineStartSmart");
        }

        // Move cursor to bullet
        const beforeBullet = line.split(bulletRegex);
        const bulletPos = beforeBullet[0].length;
        const bulletLength = beforeBullet[1].length;
        const newCh = bulletPos + bulletLength;
        // ...except if it's already there
        if (newCh === pos.ch) {
          return cm.execCommand("goLineStartSmart");
        }
        cm.setCursor({line: pos.line, ch: newCh});
    };
};
