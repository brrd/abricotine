var commands = loadComponent('commands'),
    remote = require('remote'),
    app = remote.require('app'),
    file = loadComponent('file');

Abricotine = {
    commands: commands || {},
    exec : function (command) {
        if (Abricotine.commands && Abricotine.commands[command]) {
            Abricotine.commands[command]();
        } else {
            console.log("Unknown command '" + command + "'");
        }
    },
    documents: []
};

// FIXME: Ce truc est merdique car asynchrone sans vra callback. Réécrire en synchrone ou avec de vrais callbacks (eg. ne pas créer de menus tant que la config n'est pas prête)
var userConfigPath = app.getPath('userData') + "/config.json";
if (file.existsSync(userConfigPath)) {
    file.read(userConfigPath, function (data, path) {
        Abricotine.config = JSON.parse(data);
    });
} else {
    file.write('{}',userConfigPath);
}

Abricotine.currentDocument = function () {
    return Abricotine.documents[0];
};
    
module.exports = Abricotine;