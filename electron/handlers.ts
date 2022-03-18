import {
  setDockerComposeDir,
  getDockerComposeDir as getDockerComposeDirUtil
} from './dockerComposeDir'
import { validateDockerComposeDir } from './utils'

type EventHandlerFunctionType<PayloadType> = (
  responseChannel: string
) => (event: Electron.IpcMainEvent, payload: PayloadType) => void

export const saveDockerComposeDir: EventHandlerFunctionType<string> = responseChannel => {
  return (event, payload) => {
    console.log('got it', { payload })
    const result = validateDockerComposeDir(payload)
    console.log({ result })

    if (result.success) {
      setDockerComposeDir(payload)
    }

    console.log(responseChannel)

    event.reply(responseChannel, result)
  }
}

export const getDockerComposeDir: EventHandlerFunctionType<string> = responseChannel => {
  return (event, _payload) => {
    event.reply(responseChannel, getDockerComposeDirUtil())
  }
}
