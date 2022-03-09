import React from 'react'
import ReactDOM from 'react-dom'
const electron = require('@electron/remote')
const { dialog } = electron

const App = () => {
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
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
