// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../hooks/useStore'

const STATUS_COLORS = { pending: '#FEF3C7', shipping: '#DBEAFE', delivered: '#D1FAE5', rejected: '#FEE2E2' }
const STATUS_TEXT = { pending: '#92400E', shipping: '#1E40AF', delivered: '#065F46', rejected: '#991B1B' }
const STATUS_LABEL = { pending: 'جاري معاينة الطلب', shipping: 'جاري إرسال الطلب لعنوانك', delivered: 'تم التوصيل بنجاح', rejected: 'تم الرفض' }

export default function ProfilePage() {
  const { user, orders, updateUser } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' })

  // مزامنة النموذج عند تحديث بيانات المستخدم
  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' })
  }, [user])

  const save = () => { updateUser({ ...user, ...form }); setEditing(false) }

  // نفلتر بـ supabaseId أو id للتعامل مع كلا الوضعين (Supabase & offline)
  const myOrders = orders.filter(o => {
    const uid = user?.supabaseId || user?.id
    return o.userId === uid || o.userId === user?.id || o.userId === user?.supabaseId
  }).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
      {/* Profile info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-blue-900 text-sm">👤 معلوماتي</h3>
          <button onClick={() => setEditing(!editing)} className="btn-secondary !py-1.5 !px-3 !text-xs">
            {editing ? 'إلغاء' : 'تعديل ✎'}
          </button>
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            <input className="inp" placeholder="الاسم الكامل" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="inp" placeholder="رقم الهاتف" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input className="inp" placeholder="العنوان" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={save} className="btn-primary self-end">حفظ ✓</motion.button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {[
              ['👤', 'الاسم', user?.name],
              ['📧', 'البريد', user?.email],
              ['📱', 'الهاتف', user?.phone || '—'],
              ['📍', 'العنوان', user?.address || '—'],
              ['🔐', 'الصلاحية', user?.role === 'admin' ? '👑 مدير' : 'مستخدم'],
            ].map(([icon, label, value]) => (
              <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: '#F8FAFC' }}>
                <span className="text-base">{icon}</span>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">{label}</p>
                  <p className="font-bold text-slate-800 text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Orders history */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="card p-5">
        <h3 className="font-black text-blue-900 text-sm mb-4">📦 طلباتي ({myOrders.length})</h3>

        {myOrders.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm font-semibold">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myOrders.map(order => (
              <div key={order.id} className="p-3 rounded-xl border-2 border-blue-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{order.items?.length} منتج</p>
                    <p className="text-xs text-slate-400">{order.date}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-blue-700 text-sm mb-1">{order.total} ج.م</p>
                    <span className="badge text-xs"
                      style={{ background: STATUS_COLORS[order.status] || '#eee', color: STATUS_TEXT[order.status] || '#333' }}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 truncate mb-1">📍 {order.address}</p>
                {order.status === 'rejected' && order.rejectedReason && (
                  <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-[10px] font-bold text-red-600 mb-0.5">سبب الرفض:</p>
                    <p className="text-xs text-red-800">{order.rejectedReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
