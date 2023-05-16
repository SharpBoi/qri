import './normalize.scss'
import './index.scss'
import { configure } from 'mobx'
import ReactDOM from 'react-dom/client'
import { App } from './App'

export {}

// Because QrScanner kills all MedaStream`s that needed for my WebCam
// when blur window
document.addEventListener('visibilitychange', e => {
  e.stopImmediatePropagation()
  e.stopPropagation()
})

console.re ||= console

configure({
  enforceActions: 'never',
})

const container = document.querySelector('#root') as any
if (!container) throw new Error('Root not found')

const root = ReactDOM.createRoot(container)
root.render(<App />)
