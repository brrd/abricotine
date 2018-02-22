/*
*   Abricotine - Markdown Editor
*   Copyright (c) 2015 Thomas Brouard
*   Licensed under GNU-GPLv3 <http://www.gnu.org/licenses/gpl.html>
*/

module.exports = function (CodeMirror) {
  var keyMap = CodeMirror.keyMap;
  keyMap.macAbricotine = {
    "Enter": "newlineAndIndentContinueMarkdownList",
    "Home": "homeList",
    "End": "goLineRight",
    "Tab": "indentList",
    "Shift-Tab": "indentLess",
    "Ctrl-Up": "goPrevParagraph",
    "Ctrl-Down": "goNextParagraph",
    "Shift-Cmd-F": "clearSearch",
    "Shift-Ctrl-K": "deleteLine",
    "Cmd-T": "transposeChars",
    "Ctrl-Left": "goSubwordLeft",
    "Ctrl-Right": "goSubwordRight",
    "Shift-L": "selectLine",
    "Cmd-Alt-L": "splitSelectionByLine",
    "Esc": "singleSelectionTop",
    "Cmd-Enter": "insertLineAfter",
    "Shift-Cmd-Enter": "insertLineBefore",
    "Cmd-D": "selectNextOccurrence",
    "Cmd-B": "goToBracket",
    "Cmd-Ctrl-Up": "swapLineUp",
    "Cmd-Ctrl-Down": "swapLineDown",
    "Cmd-J": "joinLines",
    "Shift-Cmd-D": "duplicateLine",
    "Backspace": "smartBackspace",
    "Cmd-K Cmd-K": "delLineRight",
    "Cmd-K Cmd-U": "upcaseAtCursor",
    "Cmd-K Cmd-L": "downcaseAtCursor",
    "Cmd-K Cmd-C": "showInCenter",
    "Cmd-K Cmd-Backspace": "delLineLeft",
    "Ctrl-Shift-Up": "addCursorToPrevLine",
    "Ctrl-Shift-Down": "addCursorToNextLine",
    "Cmd-F3": "findUnder",
    "Shift-Cmd-F3": "findUnderPrevious",
    "Alt-F3": "findAllUnder",
    "Cmd-H": "replace",
    "F3": "findNext",
    "Shift-F3": "findPrev",
    "fallthrough": "macDefault"
  };
  CodeMirror.normalizeKeyMap(keyMap.macAbricotine);

  keyMap.pcAbricotine = {
    "Enter": "newlineAndIndentContinueMarkdownList",
    "Home": "homeList",
    "End": "goLineRight",
    "Tab": "indentList",
    "Shift-Tab": "indentLess",
    "Ctrl-Up": "goPrevParagraph",
    "Ctrl-Down": "goNextParagraph",
    "Shift-Ctrl-F": "clearSearch",
    "Shift-Ctrl-K": "deleteLine",
    "Ctrl-T": "transposeChars",
    "Alt-Left": "goSubwordLeft",
    "Alt-Right": "goSubwordRight",
    "Shift-L": "selectLine",
    "Ctrl-Alt-L": "splitSelectionByLine",
    "Esc": "singleSelectionTop",
    "Ctrl-Enter": "insertLineAfter",
    "Shift-Ctrl-Enter": "insertLineBefore",
    "Ctrl-D": "selectNextOccurrence",
    "Ctrl-B": "goToBracket",
    "Ctrl-Shift-Up": "swapLineUp",
    "Ctrl-Shift-Down": "swapLineDown",
    "Ctrl-J": "joinLines",
    "Shift-Ctrl-D": "duplicateLine",
    "Backspace": "smartBackspace",
    "Ctrl-K Ctrl-K": "delLineRight",
    "Ctrl-K Ctrl-U": "upcaseAtCursor",
    "Ctrl-K Ctrl-L": "downcaseAtCursor",
    "Ctrl-K Ctrl-C": "showInCenter",
    "Ctrl-K Ctrl-Backspace": "delLineLeft",
    "Ctrl-Alt-Up": "addCursorToPrevLine",
    "Ctrl-Alt-Down": "addCursorToNextLine",
    "Ctrl-F3": "findUnder",
    "Shift-Ctrl-F3": "findUnderPrevious",
    "Alt-F3": "findAllUnder",
    "Ctrl-H": "replace",
    "F3": "findNext",
    "Shift-F3": "findPrev",
    "fallthrough": "pcDefault"
  };
  CodeMirror.normalizeKeyMap(keyMap.pcAbricotine);

  var mac = keyMap.default == keyMap.macDefault;
  keyMap.abricotine = mac ? keyMap.macAbricotine : keyMap.pcAbricotine;
};
