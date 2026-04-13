// src/pages/admin/AdminProducts.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../hooks/useStore'

const EMPTY_FORM = { name: '', price: '', stock: '', category: '', icon: '💊', description: '' }

function Modal({ title, children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="card w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5"
          style={{ borderBottom: '2px solid #EFF6FF', paddingBottom: 14 }}>
          <h3 className="font-black text-blue-900">{title}</h3>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 text-xl">✕</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')

  const up = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
  const openEdit = p => { setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category, icon: p.icon, description: p.description || '' }); setEditId(p.id); setModal(true) }

  const save = () => {
    if (!form.name || !form.price) return
    const price = +form.price
    const stock = +form.stock
    
    if (price < 0 || stock < 0) {
      return alert('السعر والكمية لا يمكن أن تكون أقل من صفر')
    }

    if (editId) updateProduct({ id: editId, ...form, price, stock })
    else addProduct({ ...form, price, stock })
    setModal(false)
  }

  const filtered = products.filter(p => !search || p.name.includes(search) || p.category.includes(search))

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-blue-900 text-sm">📦 قائمة الجرد والمنتجات ({products.length})</h3>
          <input className="inp !py-1.5 !text-xs" style={{ maxWidth: 220 }}
            placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={openAdd} className="btn-primary !py-2 !px-4 !text-xs">
          + إضافة منتج
        </motion.button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['المنتج', 'التصنيف', 'السعر', 'المخزون', 'إجراءات'].map(h => (
                <th key={h} className="text-right px-3 py-2.5 text-xs font-black text-blue-800 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="badge" style={{ background: '#EFF6FF', color: '#1565C0' }}>{p.category}</span>
                </td>
                <td className="px-3 py-2.5 font-black text-blue-700 text-sm">{p.price} ج.م</td>
                <td className="px-3 py-2.5">
                  <span className="badge"
                    style={{
                      background: p.stock > 10 ? '#D1FAE5' : p.stock > 0 ? '#FEF3C7' : '#FEE2E2',
                      color: p.stock > 10 ? '#065F46' : p.stock > 0 ? '#92400E' : '#991B1B',
                    }}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="btn-secondary !py-1 !px-2.5 !text-xs">تعديل</button>
                    <button onClick={() => deleteProduct(p.id)} className="btn-red">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-slate-400 py-8">لا توجد منتجات</p>}
      </div>

      <AnimatePresence>
        {modal && (
          <Modal title={editId ? 'تعديل المنتج' : 'إضافة منتج جديد'} onClose={() => setModal(false)}>
            <div className="flex flex-col gap-3">
              <input className="inp" placeholder="اسم المنتج *" value={form.name} onChange={up('name')} />
              <div className="grid grid-cols-2 gap-3">
                <input className="inp" type="number" placeholder="السعر (ج.م) *" value={form.price} onChange={up('price')} />
                <input className="inp" type="number" placeholder="الكمية" value={form.stock} onChange={up('stock')} />
              </div>
              <input className="inp" placeholder="التصنيف" value={form.category} onChange={up('category')} />
              <input className="inp" placeholder="الأيقونة (Emoji)" value={form.icon} onChange={up('icon')} />
              <textarea className="inp" placeholder="الوصف" rows={2} value={form.description} onChange={up('description')} style={{ resize: 'vertical' }} />
              <div className="flex gap-3 justify-end mt-2">
                <button onClick={() => setModal(false)} className="btn-secondary">إلغاء</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={save} className="btn-primary">حفظ ✓</motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
