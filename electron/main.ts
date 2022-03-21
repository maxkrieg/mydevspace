import * as path from 'path'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
const remoteMain = require('@electron/remote/main')
import { spawnSync } from 'child_process'
import {
  GET_DOCKER_COMPOSE_DIR,
  GET_DOCKER_COMPOSE_DIR_REPLY,
  SELECT_DOCKER_COMPOSE_DIR,
  SELECT_DOCKER_COMPOSE_DIR_REPLY,
  DOCKER_COMPOSE_CMD,
  DOCKER_COMPOSE_CMD_REPLY
} from '../channelConstants'
import { getDockerComposeDir, selectDockerComposeDir } from './handlers'
import { getDockerComposeDir as getDockerComposeDirUtil } from './dockerComposeDir'

let mainWindow: Electron.BrowserWindow | null

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  remoteMain.initialize()
  mainWindow = new BrowserWindow({
    title: 'Awesome App',
    width: 1000,
    height: 800,
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

  registerListeners()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function registerListeners() {
  ipcMain.on(
    SELECT_DOCKER_COMPOSE_DIR,
    selectDockerComposeDir(SELECT_DOCKER_COMPOSE_DIR_REPLY, mainWindow)
  )

  ipcMain.on(GET_DOCKER_COMPOSE_DIR, getDockerComposeDir(GET_DOCKER_COMPOSE_DIR_REPLY))
}

function runDockerComposePs(): { success: boolean; message: string } {
  process.chdir(getDockerComposeDirUtil())
  const result = spawnSync('docker-compose', ['ps'])
  console.log(result)

  // Error
  if (result.status !== 0) {
    return {
      success: false,
      message: result.stderr.toString()
    }
  }

  console.log(result.stdout.toString())
  const parts = result.stdout.toString().split('\n')
  parts.forEach(part => {
    console.log('PART')
    console.log(part)
  })
  const containers = parts.slice(2, parts.length - 1)
  console.log('-------containers---------')
  console.log(containers)

  // Success
  return {
    success: true,
    message: result.stdout.toString()
  }
}

ipcMain.on(DOCKER_COMPOSE_CMD, (event, command: string) => {
  switch (command) {
    case 'ps':
      const response = runDockerComposePs()
      event.reply(DOCKER_COMPOSE_CMD_REPLY, response)
      break
    default:
      break
  }
})
