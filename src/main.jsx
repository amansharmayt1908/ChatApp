import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './components/RegisterPage'
import LoginPage from './components/LoginPage'
import MainPage from './components/MainPage'
import ChatPage from './components/ChatPage'
import ProtectedRoute from './components/ProtectedRoute'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/main" 
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat/:chatId" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
        </Routes>
      </div>
    </Router>
    
  </StrictMode>,
)
