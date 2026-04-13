// src/pages/admin/AdminOverview.jsx
import { motion } from 'framer-motion'
import { useStore } from '../../hooks/useStore'

export default function AdminOverview() {
  const { products, users, orders } = useStore()
  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const pending = orders.filter(o => o.status === 'pending').length
  const delivered = orders.filter(o => o.status === 'delivered').length

  const stats = [
    { label: 'إجمالي الطلبات', value: orders.length, icon: '🛒', color: '#1565C0', bg: '#EFF6FF' },
    { label: 'المستخدمون', value: users.length, icon: '👥', color: '#7C3AED', bg: '#F5F3FF' },
    { label: 'الإيرادات', value: revenue + ' ج.م', icon: '💰', color: '#065F46', bg: '#D1FAE5' },
      { label: 'جرد الأدوية', value: products.length, icon: '💊', color: '#92400E', bg: '#FEF3C7' },
      { label: 'طلبات معلقة', value: pending, icon: '⏳', color: '#9F1239', bg: '#FEE2E2' },
    { label: 'تم التوصيل', value: delivered, icon: '✅', color: '#065F46', bg: '#D1FAE5' },
  ]

  const STATUS_COLORS = { pending: '#FEF3C7', shipping: '#DBEAFE', delivered: '#D1FAE5', rejected: '#FEE2E2' }
  const STATUS_TEXT   = { pending: '#92400E', shipping: '#1E40AF', delivered: '#065F46', rejected: '#991B1B' }
  const STATUS_LABEL  = { pending: 'معلق', shipping: 'جاري الشحن', delivered: 'مُوصَّل', rejected: 'مرفوض' }

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))' }}>
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: s.bg }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <h3 className="font-black text-blue-900 mb-4 text-sm">📋 آخر الطلبات</h3>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-center py-8">لا توجد طلبات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#EFF6FF' }}>
                  {['العميل', 'المجموع', 'العنوان', 'الحالة', 'التاريخ'].map(h => (
                    <th key={h} className="text-right px-3 py-2 text-xs font-black text-blue-800 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="px-3 py-2.5 font-bold text-slate-800 text-sm whitespace-nowrap">{o.userName}</td>
                    <td className="px-3 py-2.5 font-black text-blue-700 text-sm">{o.total} ج.م</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs max-w-32 overflow-hidden" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.address}</td>
                    <td className="px-3 py-2.5">
                      <span className="badge text-xs"
                        style={{ background: STATUS_COLORS[o.status], color: STATUS_TEXT[o.status] }}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 text-xs whitespace-nowrap">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
