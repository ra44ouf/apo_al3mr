// src/pages/CartPage.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../hooks/useStore'

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, cartTotal, placeOrder, user } = useStore()
  const [showCheckout, setShowCheckout] = useState(false)
  const [address, setAddress] = useState(user?.address || '')
  const [done, setDone] = useState(false)

  const handleOrder = () => {
    if (!address.trim()) return
    placeOrder(address)
    setShowCheckout(false)
    setDone(true)
  }

  if (done) return (
    <div className="text-center py-20">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <p className="text-7xl mb-4">🎉</p>
        <h2 className="font-black text-emerald-500 text-xl mb-2">تم تأكيد طلبك!</h2>
        <p className="text-slate-500 text-sm">سيتم التواصل معك قريباً عبر الهاتف</p>
        <motion.button whileHover={{ scale: 1.03 }} onClick={() => setDone(false)}
          className="btn-primary mt-6">العودة للتسوق</motion.button>
      </motion.div>
    </div>
  )

  if (cart.length === 0) return (
    <div className="text-center py-20">
      <p className="text-7xl mb-4">🛒</p>
      <h2 className="font-black text-blue-900 text-xl mb-2">السلة فارغة</h2>
      <p className="text-slate-500 text-sm mb-5">أضف منتجات من صفحة المنتجات</p>
    </div>
  )

  return (
    <div>
      <h2 className="font-black text-blue-900 mb-5 text-base">🛒 سلة التسوق ({cart.length} منتج)</h2>
      <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'start' }}>
        {/* Items */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="card p-4 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#EFF6FF' }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                  <p className="text-blue-700 font-black text-sm">{item.price} ج.م</p>
                </div>
                {/* Qty controls */}
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQty(item.id, item.qty - 1)}
                    className="w-7 h-7 rounded-lg border-2 border-blue-100 bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">−</button>
                  <span className="font-bold text-slate-800 text-sm w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.id, item.qty + 1)}
                    className="w-7 h-7 rounded-lg border-2 border-blue-100 bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">+</button>
                </div>
                <span className="font-black text-blue-900 text-sm w-14 text-center">{item.price * item.qty} ج.م</span>
                <button onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer text-base p-1">✕</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="card p-5 min-w-52">
          <h3 className="font-black text-blue-900 mb-4 text-sm">ملخص الطلب</h3>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-slate-500">المجموع</span>
            <span className="font-bold">{cartTotal} ج.م</span>
          </div>
          <div className="flex justify-between mb-4 text-sm">
            <span className="text-slate-500">التوصيل</span>
            <span className="font-bold text-emerald-500">مجاني 🎁</span>
          </div>
          <div className="border-t-2 border-blue-50 pt-3 flex justify-between mb-5">
            <span className="font-black text-sm">الإجمالي</span>
            <span className="font-black text-blue-700 text-base">{cartTotal} ج.م</span>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowCheckout(true)}
            className="btn-green w-full py-3 text-center justify-center flex">
            إتمام الطلب ✓
          </motion.button>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => e.target === e.currentTarget && setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-blue-900">تأكيد الطلب (الدفع عند الاستلام)</h3>
                <button onClick={() => setShowCheckout(false)}
                  className="bg-transparent border-none cursor-pointer text-slate-400 text-xl">✕</button>
              </div>
              <p className="text-slate-500 text-sm mb-2">عنوان التوصيل:</p>
              <textarea className="inp mb-4" rows={3}
                placeholder="أدخل عنوانك التفصيلي..."
                value={address} onChange={e => setAddress(e.target.value)} />
              <div className="flex justify-between items-center mb-4 p-3 rounded-xl" style={{ background: '#EFF6FF' }}>
                <span className="text-sm font-semibold text-blue-800">إجمالي الطلب:</span>
                <span className="font-black text-blue-700 text-base">{cartTotal} ج.م</span>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCheckout(false)} className="btn-secondary">إلغاء</button>
                <button onClick={handleOrder} className="btn-green">تأكيد الطلب →</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
