var commands = loadComponent('commands');

module.exports = {
    commands: commands || {},
    exec : function (command) {
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
    config: {}
};