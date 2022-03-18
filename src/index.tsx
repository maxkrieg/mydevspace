import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
const electronRemote = require('@electron/remote')
const electron = require('electron')
const { dialog, send } = electronRemote
const { ipcRenderer } = electron
import {
  GET_DOCKER_COMPOSE_DIR,
  GET_DOCKER_COMPOSE_DIR_REPLY,
  SAVE_DOCKER_COMPOSE_DIR,
  SAVE_DOCKER_COMPOSE_DIR_REPLY
} from '../channelConstants'

console.log('electron renderer:', electron)
console.log('electron main:', electronRemote)

const App = () => {
  const [dockerComposeDir, setDockerComposeDir] = useState('')
  const [isDockerComposeDirSaved, setIsDockerComposeDirSaved] = useState(false)
  const [composePsResult, setComposePsResult] = useState('')

  useEffect(() => {
    ipcRenderer.send(GET_DOCKER_COMPOSE_DIR)

    ipcRenderer.on(GET_DOCKER_COMPOSE_DIR_REPLY, (_event, directory) => {
      if (directory) {
        setDockerComposeDir(directory)
        setIsDockerComposeDirSaved(true)
      }
    })

    ipcRenderer.on(SAVE_DOCKER_COMPOSE_DIR_REPLY, (_event, response) => {
      if (response.success) {
        setIsDockerComposeDirSaved(true)
      } else {
        setIsDockerComposeDirSaved(false)
        dialog.showErrorBox('Error', response.message || 'Error saving docker-compose directory')
      }
    })
  }, [])

  useEffect(() => {
    ipcRenderer.on('docker-compose-reply', (event, arg) => {
      console.log('docker-compose-reply', arg)
      const { message, error } = arg
      let result = message
      if (error) {
        result += `: ${error}`
      }
      setComposePsResult(result)
    })
  }, [])

  return (
    <div>
      <h1>Mydevspace</h1>
      <div>
        <label>Please provide your docker-compose directory:</label>
        {!isDockerComposeDirSaved && (
          <>
            <input
              disabled={isDockerComposeDirSaved}
              style={{ display: 'block', marginBottom: '8px', width: '300px' }}
              value={dockerComposeDir}
              placeholder='/path/to/docker-compose'
              onChange={event => {
                setDockerComposeDir(event.target.value)
              }}
            />
            <button
              disabled={!dockerComposeDir}
              onClick={() => {
                if (!dockerComposeDir) {
                  dialog.showErrorBox('Error', 'Please provide a valid path')
                  return
                }
                ipcRenderer.send(SAVE_DOCKER_COMPOSE_DIR, dockerComposeDir)
              }}
            >
              Save
            </button>
          </>
        )}
        {isDockerComposeDirSaved && (
          <>
            <pre style={{ marginBottom: '8px' }}>{dockerComposeDir}</pre>
            <button
              onClick={() => {
                setIsDockerComposeDirSaved(false)
              }}
            >
              Edit
            </button>
          </>
        )}
      </div>
      <div>
        <h2>Running Services</h2>
        <div>
          <button
            disabled={!isDockerComposeDirSaved}
            onClick={() => {
              ipcRenderer.send('docker-compose-command', 'ps')
            }}
          >
            Run docker-compose ps
          </button>
        </div>
        <div>{composePsResult}</div>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
