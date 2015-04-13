var commands = loadComponent('commands');

module.exports = {
    version: "0.0.1", // TODO: get from package.json (or grunt)
    commands: commands || {},
    exec : function (command) { // TODO: execCommand = standard
        if (this.commands && this.commands[command]) {
            this.commands[command]();
        } else {
            console.log("Unknown command '" + command + "'");
        }
    },
    documents: [],
    currentDocument: function () {
        return Abricotine.documents[0];
    },
    config: {},
    menu: {},
    contextMenu: {},
    /* getMenuItem("file:open"). FIXME: Uses labels: no good for i18n */
    // TODO: use it (undo, redo, save, findNext, findPrev, clearSearch...)
    getMenuItem: function (label, menu) {
        function findMenuItem (menu) {
            if (!menu.items || !label || typeof label !== "string") {
                return false;
            }
            var items = menu.items,
                foundItem;
            label = label.trim();
            for (var i=0; i<items.length; i++) {
                if (items[i].label.trim()  === label) {
                    return items[i];
                }
                if (items[i].submenu) {
                    foundItem = findMenuItem(items[i].submenu);
                    if (foundItem) {
                        return foundItem;
                    }
                }
            }
            return false;
        }
        menu = menu || Abricotine.menu;
        return findMenuItem(menu);
    },
    isPaneVisible: function () {
        return $('body').hasClass('pane-visible');
    },
    setTocHtml: function (toc) {
        if (toc.length === 0) {
            return;
        }
        var html = "<ul>";
        for (var i=0; i<toc.length; i++) {
            html += '\n<li class="toc-h' + toc[i].level + '" data-abricotine-gotoline="' + toc[i].line + '">' + toc[i].content + '</li>';
        }
        html += "</ul>";
        $('#pane').html(html);
    }
};