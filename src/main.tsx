import { configure } from 'mobx'
import ReactDOM from 'react-dom/client'
import { App } from './App'

configure({
  enforceActions: 'never',
})

const container = document.querySelector('#root') as any
if (!container) throw new Error('Root not found')

const root = ReactDOM.createRoot(container)
root.render(<App />)
