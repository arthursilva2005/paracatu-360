import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './App'
import AuthProvider from './context/AuthContext'
import './index.css'

const router = createBrowserRouter([{
  path: '*',
  element: <AuthProvider><App /></AuthProvider>,
}])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
