// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider, useStore } from './hooks/useStore'
import Landing from './components/Landing'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

function PrivateRoute({ children }) {
  const { user } = useStore()
  return user ? children : <Navigate to="/auth" replace />
}

function AppRouter() {
  const { user } = useStore()
  const [showLanding, setShowLanding] = useState(() => !sessionStorage.getItem('ao_seen'))

  const doneLanding = () => {
    sessionStorage.setItem('ao_seen', '1')
    setShowLanding(false)
  }

  // Show landing animation on first visit
  if (showLanding && !user) return <Landing onDone={doneLanding} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <div className="min-h-screen" style={{ background: '#EFF6FF' }}>
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 py-5">
                <HomePage />
              </main>
              <Toast />
            </div>
          </PrivateRoute>
        } />
        <Route path="/products" element={
          <PrivateRoute>
            <div className="min-h-screen" style={{ background: '#EFF6FF' }}>
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 py-5"><ProductsPage /></main>
              <Toast />
            </div>
          </PrivateRoute>
        } />
        <Route path="/cart" element={
          <PrivateRoute>
            <div className="min-h-screen" style={{ background: '#EFF6FF' }}>
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 py-5"><CartPage /></main>
              <Toast />
            </div>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <div className="min-h-screen" style={{ background: '#EFF6FF' }}>
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 py-5"><ProfilePage /></main>
              <Toast />
            </div>
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute>
            <div className="min-h-screen" style={{ background: '#EFF6FF' }}>
              <Navbar />
              <main className="max-w-6xl mx-auto px-4 py-5"><AdminPage /></main>
              <Toast />
            </div>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  )
}
