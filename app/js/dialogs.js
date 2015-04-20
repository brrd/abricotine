var remote = require('remote'),
    dialog = remote.require('dialog');

module.exports = {
    askClose : function (path) {
        if (!path) {
            path = 'New document';
        }        
        var userChoice = dialog.showMessageBox(remote.getCurrentWindow(), {
                title: 'Unsaved document',
                message: 'Do you really want to close \'' + path + '\' without saving?',
                buttons: ['Cancel', 'Save & close', 'Close without saving']
            });
        switch (userChoice) {
            case 1:
                return Abricotine.getCurrentDocument().save();
            case 2:
                return true;
        }
        return false;
    },
    askOpenPath: function () {
        var path = dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: 'Open document',
            properties: ['openFile']
        });
        if (path) {
            return path[0];
        }
        return false;
    },
    askSavePath: function () {
        var path = dialog.showSaveDialog(remote.getCurrentWindow(), {
            title: 'Save document'
        });
        // TODO: file already exists
        if (path) {
            return path; // TODO: ajouter l'extention si elle n'y est pas.
        }
        return false;
    }
};