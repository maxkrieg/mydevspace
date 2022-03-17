import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
const remoteMain = require('@electron/remote/main')
import { spawnSync } from 'child_process'
import fs from 'fs'

// console.log(__dirname)

let mainWindow: Electron.BrowserWindow | null

const isDev = process.env.NODE_ENV === 'development'

let dockerComposeDirectory = ''

// if (isDev) {
//   require('electron-reload')
// }

function createWindow() {
  remoteMain.initialize()
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
  remoteMain.enable(mainWindow.webContents)

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

ipcMain.on('anything-asynchronous', (event, payload) => {
  // execute tasks on behalf of renderer process
  event.reply('asynchronous-reply', { message: payload.message })
  dialog.showMessageBox({ message: 'Message from main process' })
})

ipcMain.on('get-docker-compose-directory', (event, _payload) => {
  event.reply('get-docker-compose-directory-reply', dockerComposeDirectory)
})

ipcMain.on('save-docker-compose-directory', (event, payload) => {
  try {
    // TODO: sanitize directory
    if (fs.existsSync(payload)) {
      console.log('foo')
      dockerComposeDirectory = payload
      event.reply('save-docker-compose-directory-reply', {
        success: true
      })
    } else {
      console.log('Directory does not exist.')
      event.reply('save-docker-compose-directory-reply', {
        success: false,
        message: 'Directory does not exist.'
      })
    }
  } catch (e) {
    console.log('An error occurred.')
    event.reply('save-docker-compose-directory-reply', {
      success: false,
      message: 'An error occurred.'
    })
  }
})

ipcMain.on('docker-compose-command', (event, payload) => {
  switch (payload.command) {
    case 'ps':
      try {
        process.chdir(payload.dir)
      } catch (e) {
        console.log(e)
        event.reply('docker-compose-reply', {
          message: 'Error listing containers',
          error: 'Not a valid docker-compsoe directory'
        })
      }

      const result = spawnSync('docker-compose', ['ps'])

      // Error
      if (result.status === 1) {
        event.reply('docker-compose-reply', {
          message: 'Error listing containers',
          error: result.stderr.toString()
        })
        return
      }

      // Success
      event.reply('docker-compose-reply', {
        message: result.stdout.toString()
      })
      break
    default:
      break
  }
})
