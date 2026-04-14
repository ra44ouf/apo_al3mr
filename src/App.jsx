// src/App.jsx
import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider, useStore } from './hooks/useStore'
import Landing from './components/Landing'
import Navbar from './components/Navbar'
import Toast from './components/Toast'

const HomePage      = lazy(() => import('./pages/HomePage'))
const ProductsPage  = lazy(() => import('./pages/ProductsPage'))
const CartPage      = lazy(() => import('./pages/CartPage'))
const ProfilePage   = lazy(() => import('./pages/ProfilePage'))
const AdminPage     = lazy(() => import('./pages/AdminPage'))
const AuthPage      = lazy(() => import('./pages/AuthPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid #0F3460', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
      <Toast />
    </div>
  )
}

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

  if (showLanding && !user) return <Landing onDone={doneLanding} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={
          <Suspense fallback={<PageLoader />}>
            {user ? <Navigate to="/" /> : <AuthPage />}
          </Suspense>
        } />
        <Route path="/" element={<PrivateRoute><Layout><HomePage /></Layout></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Layout><ProductsPage /></Layout></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Layout><CartPage /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Layout><AdminPage /></Layout></PrivateRoute>} />
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
