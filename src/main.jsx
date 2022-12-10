import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom';
import './styles/index.css'
import { AuthProvider } from './context/AuthProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
    </HashRouter>
  </React.StrictMode>
)
