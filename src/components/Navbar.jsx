// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../hooks/useStore'

export default function Navbar() {
  const { user, cartCount, logout } = useStore()
  const location = useLocation()

  const links = [
    { to: '/', label: 'الرئيسية', icon: '🏠' },
    { to: '/products', label: 'المنتجات', icon: '💊' },
    { to: '/cart', label: 'السلة', icon: '🛒', badge: cartCount },
    { to: '/profile', label: 'حسابي', icon: '👤' },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'لوحة التحكم', icon: '⚙️' }] : []),
  ]

  return (
    <nav className="bg-white sticky top-0 z-50" style={{ boxShadow: '0 2px 16px rgba(21,101,192,0.1)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>⊕</div>
          <span className="font-black text-blue-900 text-sm hidden sm:block">صيدلية أبو العمر</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(link => {
            const active = location.pathname === link.to
            return (
              <Link key={link.to} to={link.to} className="no-underline relative">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                  style={{
                    background: active ? '#EFF6FF' : 'transparent',
                    color: active ? '#1565C0' : '#64748B',
                  }}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span className="hidden sm:block">{link.label}</span>
                  {link.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}
          <button onClick={logout}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1.5 rounded-xl border-none bg-transparent cursor-pointer font-semibold">
            خروج
          </button>
        </div>
      </div>
    </nav>
  )
}
