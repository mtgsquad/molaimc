const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const { electron } = require('process')
const shell = require('electron').shell
const { ipcMain } = require('electron')
let win;

function createWindow () {
  win = new BrowserWindow({
    frame: false,
    width: 1250,
    height: 750,
    backgroundColor: '#262626',
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('src/index.html');
  // win.maximize();
  // win.webContents.openDevTools()
  
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('close-app', (event) => { 
  app.quit();
});

ipcMain.on('minimize-app', (event) => { 
  win.minimize(); 
});

ipcMain.on('maximize-app', (event) => { 
  if ( win.isMaximized() ) {
    win.unmaximize();  
  } else {
    win.maximize(); 
  }
});

ipcMain.on('devtools', (event) => { 
  win.webContents.openDevTools()
});

ipcMain.on('reload-app', (event) => { 
  app.relaunch();
  app.quit();
});

ipcMain.on('hideLauncher', (event) => { 
  win.hide();
});

ipcMain.on('showLauncher', (event) => { 
  win.show();
});