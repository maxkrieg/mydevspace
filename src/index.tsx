import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
const electronRemote = require('@electron/remote')
const electron = require('electron')
const { dialog, send } = electronRemote
const { ipcRenderer } = electron
import {
  GET_DOCKER_COMPOSE_DIR,
  GET_DOCKER_COMPOSE_DIR_REPLY,
  SELECT_DOCKER_COMPOSE_DIR,
  SELECT_DOCKER_COMPOSE_DIR_REPLY,
  DOCKER_COMPOSE_CMD,
  DOCKER_COMPOSE_CMD_REPLY
} from '../channelConstants'

console.log('electron renderer:', electron)
console.log('electron main:', electronRemote)

const App = () => {
  const [dockerComposeDir, setDockerComposeDir] = useState('')
  const [composePsResult, setComposePsResult] = useState('')

  useEffect(() => {
    ipcRenderer.send(GET_DOCKER_COMPOSE_DIR)
    ipcRenderer.on(GET_DOCKER_COMPOSE_DIR_REPLY, (_event, directory) => {
      console.log('GET_DOCKER_COMPOSE_DIR_REPLYY:', directory)
      if (directory) {
        setDockerComposeDir(directory)
      }
    })

    ipcRenderer.on(SELECT_DOCKER_COMPOSE_DIR_REPLY, (_event, response) => {
      console.log('SELECT_DOCKER_COMPOSE_DIR_REPLY:', response)
      if (response.success) {
        setDockerComposeDir(response.message)
      }
    })
  }, [])

  useEffect(() => {
    ipcRenderer.on(DOCKER_COMPOSE_CMD_REPLY, (event, arg) => {
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
    <div style={{ padding: '20px 40px' }}>
      <h1>Mydevspace</h1>
      <div>
        <h3>
          {dockerComposeDir
            ? 'Current docker-compose directory:'
            : 'Please select your docker-compose directory'}
        </h3>
        <div>
          {dockerComposeDir && <pre style={{ marginBottom: '8px' }}>{dockerComposeDir}</pre>}
          <button
            onClick={() => {
              ipcRenderer.send(SELECT_DOCKER_COMPOSE_DIR)
            }}
          >
            {dockerComposeDir ? 'Change directory' : 'Select directory'}
          </button>
        </div>
      </div>
      <div>
        <h2>Running Services</h2>
        <div>
          <button
            disabled={!dockerComposeDir}
            onClick={() => {
              ipcRenderer.send(DOCKER_COMPOSE_CMD, 'ps')
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
