const { app, BrowserWindow } = require('electron')
const path = require('path')

// Start the Express backend server when Electron starts
require('./server.js')

const createWindow = () => {
    const objWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    })
    
    // Load index.html from the public folder served by Express
    objWindow.loadURL('http://localhost:3000')
    
    // TODO: Comment this line out before final submission***********************************************************
    objWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    // Express delay start effect
    setTimeout(() => {
        createWindow()
    }, 500)
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length < 1) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})