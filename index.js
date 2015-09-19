/*
    Abricotine
*/

function openNewWindow () {
    var mainWindow = null;
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Abricotine",
        'auto-hide-menu-bar': false,
        icon: __dirname + '/abricotine.png'
    });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

var app = require('app'),
    BrowserWindow = require('browser-window'),
    ipc = require('ipc');

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {
    openNewWindow();
});

// Handle multiple windows
ipc.on('asynchronous-message', function(event, arg) {
  if (arg === "openNewWindow") {
    openNewWindow();
  }
});
