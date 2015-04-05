/*
    Abricotine
*/

var app = require('app'),
    BrowserWindow = require('browser-window'),
    mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({      
        width: 800, 
        height: 600, 
        'auto-hide-menu-bar': false,
        icon: __dirname + '/abricotine.png'
    });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});