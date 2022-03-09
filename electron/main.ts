import { app, BrowserWindow } from 'electron'
import * as path from 'path'

let mainWindow: Electron.BrowserWindow | null

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  require('@electron/remote/main').initialize()
  mainWindow = new BrowserWindow({
    title: 'Awesome App',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  require('@electron/remote/main').enable(mainWindow.webContents)

  mainWindow.loadURL(
    isDev ? 'http://localhost:4000' : `file://${path.join(__dirname, '../index.html')}`
  )

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// app.on('ready', createWindow)
// app.allowRendererProcessReuse = true

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
