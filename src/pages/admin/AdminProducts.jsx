// src/pages/admin/AdminProducts.jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Link, X, Loader, Pill, ImageOff } from 'lucide-react'
import { useStore } from '../../hooks/useStore'

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'de65xcu2q'
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET || 'wcpsf'

const EMPTY_FORM = {
  name: '', price: '', stock: '', category: '', icon: '💊',
  description: '', image_url: '',
}

// ── Cloudinary unsigned upload ────────────────────────
async function uploadToCloudinary(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: fd }
  )
  if (!res.ok) throw new Error('فشل الرفع')
  const data = await res.json()
  return data.secure_url
}

// ── Image preview component ───────────────────────────
function ImagePreview({ url, onRemove }) {
  if (!url) return null
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center"
      style={{ height: 140 }}>
      <img src={url} alt="preview" className="w-full h-full object-contain p-2" />
      <button
        onClick={onRemove}
        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center border-none cursor-pointer"
      >
        <X size={13} color="#EF4444" />
      </button>
    </div>
  )
}

// ── Modal wrapper ─────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
        className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 pb-4"
          style={{ borderBottom: '1px solid #F3F4F6' }}>
          <h3 className="font-black text-gray-900">{title}</h3>
          <button onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
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
  const [uploading, setUploading] = useState(false)
  const [imageMode, setImageMode] = useState('upload') // 'upload' | 'url'
  const fileRef = useRef()

  const up = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setImageMode('upload')
    setModal(true)
  }

  const openEdit = p => {
    setForm({
      name: p.name, price: p.price, stock: p.stock,
      category: p.category, icon: p.icon || '💊',
      description: p.description || '', image_url: p.image_url || '',
    })
    setEditId(p.id)
    setImageMode('url')
    setModal(true)
  }

  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setForm(f => ({ ...f, image_url: url }))
    } catch {
      alert('فشل رفع الصورة — تأكد من إعداد Cloudinary')
    }
    setUploading(false)
    e.target.value = ''
  }

  const save = () => {
    if (!form.name || !form.price) return
    const price = +form.price
    const stock = +form.stock || 0
    if (price < 0 || stock < 0) return alert('السعر والكمية لا يمكن أن تكون أقل من صفر')

    const payload = { ...form, price, stock }
    if (editId) updateProduct({ id: editId, ...payload })
    else addProduct(payload)
    setModal(false)
  }

  const filtered = products.filter(p =>
    !search || p.name.includes(search) || p.category.includes(search)
  )

  return (
    <div>
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-black text-gray-900 text-sm">قائمة المنتجات ({products.length})</h3>
          <input
            className="inp !py-1.5 !text-xs"
            style={{ maxWidth: 220 }}
            placeholder="بحث..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={openAdd} className="btn-primary !py-2 !px-4 !text-xs">
          + إضافة منتج
        </motion.button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['الصورة', 'المنتج', 'التصنيف', 'السعر', 'المخزون', 'إجراءات'].map(h => (
                <th key={h} className="text-right px-3 py-3 text-xs font-black text-gray-500 whitespace-nowrap"
                  style={{ borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors"
                style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td className="px-3 py-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt="" className="w-full h-full object-contain p-1"
                        onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <Pill size={18} color="#CBD5E1" />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{p.category}</span>
                </td>
                <td className="px-3 py-2.5 font-black text-[#0F3460] text-sm">{p.price} ج.م</td>
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
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">لا توجد منتجات</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <Modal title={editId ? 'تعديل المنتج' : 'إضافة منتج جديد'} onClose={() => setModal(false)}>
            <div className="flex flex-col gap-3">
              <input className="inp" placeholder="اسم المنتج *" value={form.name} onChange={up('name')} />

              <div className="grid grid-cols-2 gap-3">
                <input className="inp" type="number" placeholder="السعر (ج.م) *" value={form.price} onChange={up('price')} />
                <input className="inp" type="number" placeholder="الكمية" value={form.stock} onChange={up('stock')} />
              </div>

              <input className="inp" placeholder="التصنيف (مسكنات، فيتامينات...)" value={form.category} onChange={up('category')} />
              <textarea className="inp" placeholder="الوصف" rows={2} value={form.description} onChange={up('description')} style={{ resize: 'vertical' }} />

              {/* Image section */}
              <div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setImageMode('upload')}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border-none cursor-pointer transition-all"
                    style={{ background: imageMode === 'upload' ? '#0F3460' : '#F3F4F6', color: imageMode === 'upload' ? '#fff' : '#6B7280', fontFamily: 'inherit' }}
                  >
                    <Upload size={13} /> رفع صورة
                  </button>
                  <button
                    onClick={() => setImageMode('url')}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border-none cursor-pointer transition-all"
                    style={{ background: imageMode === 'url' ? '#0F3460' : '#F3F4F6', color: imageMode === 'url' ? '#fff' : '#6B7280', fontFamily: 'inherit' }}
                  >
                    <Link size={13} /> رابط صورة
                  </button>
                </div>

                {imageMode === 'upload' ? (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {!form.image_url ? (
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="w-full rounded-xl flex flex-col items-center justify-center gap-2 py-6 cursor-pointer border-none transition-all"
                        style={{ background: '#F8FAFC', border: '2px dashed #E5E7EB' }}
                      >
                        {uploading ? (
                          <Loader size={22} color="#9CA3AF" className="animate-spin" />
                        ) : (
                          <Upload size={22} color="#9CA3AF" />
                        )}
                        <span className="text-xs text-gray-400 font-semibold">
                          {uploading ? 'جاري الرفع إلى Cloudinary...' : 'اضغط لاختيار صورة'}
                        </span>
                        <span className="text-[10px] text-gray-300">PNG, JPG, WEBP</span>
                      </button>
                    ) : (
                      <ImagePreview url={form.image_url} onRemove={() => setForm(f => ({ ...f, image_url: '' }))} />
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      className="inp text-xs mb-2"
                      placeholder="https://example.com/drug-image.jpg"
                      value={form.image_url}
                      onChange={up('image_url')}
                    />
                    {form.image_url && (
                      <ImagePreview url={form.image_url} onRemove={() => setForm(f => ({ ...f, image_url: '' }))} />
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-1">
                <button onClick={() => setModal(false)} className="btn-secondary">إلغاء</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={save} className="btn-primary">
                  حفظ
                </motion.button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
