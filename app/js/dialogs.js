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
    askOpenPath: function (title) {
        var path = dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: title || 'Open document',
            properties: ['openFile'],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },
    askSavePath: function (title) {
        var path = dialog.showSaveDialog(remote.getCurrentWindow(), {
            title: title || 'Save document',
            defaultPath: process.cwd()
        });
        // TODO: file already exists
        // TODO: readonly file
        if (path) {
            return path; // TODO: ajouter l'extention si elle n'y est pas.
        }
        return false;
    },
    askOpenImage: function (title) {
        var path = dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: title || 'Insert image',
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg'] }],
            defaultPath: process.cwd()
        });
        if (path) {
            return path[0];
        }
        return false;
    },
};
