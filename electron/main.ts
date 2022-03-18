import * as path from 'path'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
const remoteMain = require('@electron/remote/main')
import { spawnSync } from 'child_process'
import {
  SAVE_DOCKER_COMPOSE_DIR,
  SAVE_DOCKER_COMPOSE_DIR_REPLY,
  GET_DOCKER_COMPOSE_DIR,
  GET_DOCKER_COMPOSE_DIR_REPLY
} from '../channelConstants'
import { saveDockerComposeDir, getDockerComposeDir } from './handlers'

let mainWindow: Electron.BrowserWindow | null

const isDev = process.env.NODE_ENV === 'development'

let dockerComposeDirectory = ''

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

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on(GET_DOCKER_COMPOSE_DIR, getDockerComposeDir(GET_DOCKER_COMPOSE_DIR_REPLY))
ipcMain.on(SAVE_DOCKER_COMPOSE_DIR, saveDockerComposeDir(SAVE_DOCKER_COMPOSE_DIR_REPLY))

function runDockerComposePs(): { success: boolean; message: string } {
  process.chdir(dockerComposeDirectory)
  const result = spawnSync('docker-compose', ['ps'])

  // Error
  if (result.status === 1) {
    return {
      success: false,
      message: result.stderr.toString()
    }
  }

  // Success
  return {
    success: true,
    message: result.stdout.toString()
  }
}

ipcMain.on('docker-compose-command', (event, command: string) => {
  switch (command) {
    case 'ps':
      const response = runDockerComposePs()
      event.reply('docker-compose-command-reply', response)
      break
    default:
      break
  }
})
