import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.tsx'
import './index.css'


{/*{const LandingPageRedirect = () => {
  // In development, redirect to the landing page on port 5174
  if (import.meta.env.DEV) {
    window.location.href = 'http://localhost:5174'
    return null
  }
  // In production, this would be handled differently
  return <Navigate to="/login" />
}
}
*/}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      {/* <Route path="/" element={<LandingPageRedirect />}/> 
       {/* remove above comment for landing page */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
