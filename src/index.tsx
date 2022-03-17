import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
const electronRemote = require('@electron/remote')
const electron = require('electron')
const { dialog, send } = electronRemote
const { ipcRenderer } = electron

console.log('electron renderer:', electron)
console.log('electron main:', electronRemote)

const App = () => {
  const [dockerComposeDir, setDockerComposeDir] = useState('')
  const [isDockerComposeDirSaved, setIsDockerComposeDirSaved] = useState(false)
  const [composePsResult, setComposePsResult] = useState('')

  useEffect(() => {
    ipcRenderer.send('get-docker-compose-directory')

    ipcRenderer.on('get-docker-compose-directory-reply', (event, arg) => {
      console.log('get-docker-compose-directory-reply:', arg)
      if (arg) {
        setDockerComposeDir(arg)
        setIsDockerComposeDirSaved(true)
      }
    })

    ipcRenderer.on('save-docker-compose-directory-reply', (event, arg) => {
      console.log('save-docker-compose-directory-reply:', arg)
      if (arg.success) {
        setIsDockerComposeDirSaved(true)
      } else {
        setIsDockerComposeDirSaved(false)
        dialog.showErrorBox('Error', arg.message)
      }
    })
  }, [])

  useEffect(() => {
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      const { message } = arg
      dialog.showMessageBox({ message, title: 'awesome stuff' })
    })

    ipcRenderer.on('docker-compose-reply', (event, arg) => {
      console.log('docker-compose-reply', arg)
      const { message, error } = arg
      let result = message
      if (error) {
        result += `: ${error}`
      }
      setComposePsResult(result)
      console.log('foo')
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
                // setIsDockerComposeDirSaved(true)
                ipcRenderer.send('save-docker-compose-directory', dockerComposeDir)
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
            disabled={!dockerComposeDir}
            onClick={() => {
              ipcRenderer.send('docker-compose-command', { command: 'ps', dir: dockerComposeDir })
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
