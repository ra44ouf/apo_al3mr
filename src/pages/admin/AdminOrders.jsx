// src/pages/admin/AdminOrders.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../hooks/useStore'

const STATUS_COLORS = { pending: '#FEF3C7', shipping: '#DBEAFE', delivered: '#D1FAE5', rejected: '#FEE2E2' }
const STATUS_TEXT   = { pending: '#92400E', shipping: '#1E40AF', delivered: '#065F46', rejected: '#991B1B' }
const STATUS_LABEL  = { pending: 'جاري المعاينة', shipping: 'جاري الشحن', delivered: 'مُوصَّل', rejected: 'مرفوض' }

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore()
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(null)

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const handleReject = (id) => {
    if (!rejectReason.trim()) return alert('الرجاء كتابة سبب الرفض')
    updateOrderStatus(id, 'rejected', rejectReason)
    setRejectReason('')
    setShowRejectModal(null)
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: 'all', label: 'الكل', count: orders.length },
          { key: 'pending', label: 'معلقة', count: orders.filter(o => o.status === 'pending').length },
          { key: 'shipping', label: 'جاري الشحن', count: orders.filter(o => o.status === 'shipping').length },
          { key: 'delivered', label: 'مُوصَّل', count: orders.filter(o => o.status === 'delivered').length },
          { key: 'rejected', label: 'مرفوض', count: orders.filter(o => o.status === 'rejected').length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all"
            style={{
              background: filter === tab.key ? '#1565C0' : '#fff',
              color: filter === tab.key ? '#fff' : '#64748B',
              boxShadow: filter === tab.key ? '0 3px 10px rgba(21,101,192,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
              fontFamily: 'inherit',
            }}>
            {tab.label}
            <span className="px-1.5 py-0.5 rounded-full text-xs font-black"
              style={{
                background: filter === tab.key ? 'rgba(255,255,255,0.25)' : '#EFF6FF',
                color: filter === tab.key ? '#fff' : '#1565C0',
              }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order, i) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card overflow-hidden"
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/30 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-blue-700"
                    style={{ background: '#EFF6FF' }}>
                    {order.userName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{order.userName}</p>
                    <p className="text-xs text-slate-400">{order.date} · {order.items?.length} منتج</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-blue-700 text-sm">{order.total} ج.م</span>
                  <span className="badge"
                    style={{ background: STATUS_COLORS[order.status], color: STATUS_TEXT[order.status] }}>
                    {STATUS_LABEL[order.status]}
                  </span>
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, 'shipping') }}
                        className="btn-primary !py-1.5 !px-3 !text-xs !bg-emerald-600">
                        موافقة ✓
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={e => { e.stopPropagation(); setShowRejectModal(order.id) }}
                        className="btn-primary !py-1.5 !px-3 !text-xs !bg-red-500">
                        رفض ✕
                      </motion.button>
                    </div>
                  )}
                  {order.status === 'shipping' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, 'delivered') }}
                      className="btn-primary !py-1.5 !px-3 !text-xs">
                      تم التوصيل ←
                    </motion.button>
                  )}
                  <span className="text-slate-300 text-sm">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence initial={false}>
                {expanded === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t-2 border-blue-50 bg-slate-50/50"
                  >
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 mb-1">📍 عنوان التوصيل</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{order.address}</p>
                        </div>
                        {order.status === 'rejected' && order.rejectedReason && (
                          <div>
                            <p className="text-[10px] font-bold text-red-400 mb-1">❌ سبب الرفض</p>
                            <p className="text-xs text-red-600 leading-relaxed">{order.rejectedReason}</p>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] font-bold text-slate-400 mb-2">📦 محتويات الطلب</p>
                      <div className="flex flex-col gap-2">
                        {order.items?.map(item => (
                          <div key={item.productId} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                            <span className="text-xs font-bold text-slate-700">{item.name}</span>
                            <span className="text-xs text-slate-400">
                              {item.qty} × {item.price} = <span className="font-black text-blue-700">{item.qty * item.price} ج.م</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-black text-blue-900 mb-4">سبب رفض الطلب</h3>
              <textarea
                className="inp w-full mb-4"
                rows={3}
                placeholder="اكتب سبب الرفض هنا ليظهر للمستخدم..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowRejectModal(null)} className="btn-secondary">إلغاء</button>
                <button onClick={() => handleReject(showRejectModal)} className="btn-primary !bg-red-500">تأكيد الرفض</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
