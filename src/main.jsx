import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { DatabaseProvider } from './contexts/DatabaseContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DatabaseProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </DatabaseProvider>
  </React.StrictMode>,
)
