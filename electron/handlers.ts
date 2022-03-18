import { dialog } from 'electron'
import {
  setDockerComposeDir,
  getDockerComposeDir as getDockerComposeDirUtil
} from './dockerComposeDir'
import { validateDockerComposeDir } from './utils'

type EventHandlerFunctionType<PayloadType = string> = (
  responseChannel: string,
  mainWindow?: Electron.BrowserWindow | null
) => (event: Electron.IpcMainEvent, payload: PayloadType) => void

export const getDockerComposeDir: EventHandlerFunctionType<string> = responseChannel => {
  return (event, _payload) => {
    event.reply(responseChannel, getDockerComposeDirUtil())
  }
}

export const selectDockerComposeDir: EventHandlerFunctionType =
  (responseChannel, mainWindow) => async (event, payload) => {
    if (!mainWindow) return
    const openDirectoryResult = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    console.log('directories selected', openDirectoryResult.filePaths)
    const selectedDir = openDirectoryResult.filePaths[0]
    process.chdir(selectedDir)

    const result = validateDockerComposeDir(selectedDir)
    console.log(result)

    if (result.success) {
      setDockerComposeDir(selectedDir)
    } else {
      dialog.showErrorBox('Error', result.message || 'Error saving docker-compose directory')
    }
    event.reply(responseChannel, result)
  }
