// src/pages/AdminPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../hooks/useStore'
import AdminOverview from './admin/AdminOverview'
import AdminProducts from './admin/AdminProducts'
import AdminDrugAPI from './admin/AdminDrugAPI'
import AdminUsers from './admin/AdminUsers'
import AdminOrders from './admin/AdminOrders'

const TABS = [
  { id: 'overview',  label: 'نظرة عامة',    icon: '📊' },
  { id: 'products',  label: 'الجرد والمنتجات', icon: '📦' },
  { id: 'drugapi',   label: 'أدوية FDA',     icon: '🔎' },
  { id: 'users',     label: 'المستخدمون',   icon: '👥' },
  { id: 'orders',    label: 'الطلبات',       icon: '🛒' },
]

export default function AdminPage() {
  const { user } = useStore()
  const [tab, setTab] = useState('overview')

  if (user?.role !== 'admin') return (
    <div className="text-center py-20">
      <p className="text-6xl mb-4">🔒</p>
      <h2 className="font-black text-red-500 text-xl">غير مصرح بالدخول</h2>
    </div>
  )

  const components = {
    overview: <AdminOverview />,
    products: <AdminProducts />,
    drugapi:  <AdminDrugAPI />,
    users:    <AdminUsers />,
    orders:   <AdminOrders />,
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>⚙️</div>
        <div>
          <h2 className="font-black text-blue-900 text-base">لوحة تحكم المدير</h2>
          <p className="text-xs text-slate-400">مرحباً، {user.name} 👑</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 flex-wrap">
        {TABS.map(t => (
          <motion.button key={t.id}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer whitespace-nowrap transition-all"
            style={{
              background: tab === t.id ? '#1565C0' : '#fff',
              color: tab === t.id ? '#fff' : '#64748B',
              boxShadow: tab === t.id ? '0 4px 12px rgba(21,101,192,0.3)' : '0 1px 4px rgba(0,0,0,0.06)',
              fontFamily: 'inherit',
            }}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab content with animation */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {components[tab]}
      </motion.div>
    </div>
  )
}
