import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  
  /* 
    on strict mode onClick was rendering two times in react component. So Disable it.
  */
  
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)
