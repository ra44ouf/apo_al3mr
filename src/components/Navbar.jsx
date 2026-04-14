// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, ShoppingCart, User, Settings, LogOut } from 'lucide-react'
import { useStore } from '../hooks/useStore'

export default function Navbar() {
  const { user, cartCount, logout } = useStore()
  const location = useLocation()

  const links = [
    { to: '/', label: 'الرئيسية', Icon: Home },
    { to: '/products', label: 'المنتجات', Icon: ShoppingBag },
    { to: '/cart', label: 'السلة', Icon: ShoppingCart, badge: cartCount },
    { to: '/profile', label: 'حسابي', Icon: User },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'التحكم', Icon: Settings }] : []),
  ]

  return (
    <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img
            src="/logo.png"
            alt="صيدلية أبو العمر"
            className="w-10 h-10 rounded-xl object-cover"
            style={{ background: '#fff' }}
          />
          <div className="hidden sm:block">
            <p className="font-black text-[#0F3460] text-sm leading-none">صيدلية أبو العمر</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">Abu Omar Pharmacy</p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-0.5">
          {links.map(({ to, label, Icon, badge }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} className="no-underline relative">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
                  style={{
                    background: active ? '#EEF2FF' : 'transparent',
                    color: active ? '#0F3460' : '#6B7280',
                  }}
                >
                  <Icon size={15} />
                  <span className="hidden sm:block">{label}</span>
                  {badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            )
          })}

          <div style={{ width: 1, height: 24, background: '#E5E7EB', margin: '0 6px' }} />

          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">خروج</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
