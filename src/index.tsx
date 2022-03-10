import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
const electronRemote = require('@electron/remote')
const electron = require('electron')
const { dialog, send } = electronRemote
const { ipcRenderer } = electron

console.log('electron renderer:', electron)
console.log('electron main:', electronRemote)

const App = () => {
  useEffect(() => {
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      const { message } = arg
      dialog.showMessageBox({ message, title: 'awesome stuff' })
    })
  }, [])
  return (
    <div>
      Hellooooo world!
      <button
        onClick={() => {
          dialog.showErrorBox('Error Box', 'Fatal Error')
        }}
      >
        Show Error Box
      </button>
      <button
        onClick={() => {
          ipcRenderer.send('anything-asynchronous', { message: 'Hello from renderer' })
        }}
      >
        Send Ping
      </button>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
