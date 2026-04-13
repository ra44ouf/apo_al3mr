// src/pages/ProductsPage.jsx
import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import ProductCard from '../components/ProductCard'

export default function ProductsPage() {
  const { products } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('الكل')
  const [sortBy, setSortBy] = useState('default')

  const categories = ['الكل', ...new Set(products.map(p => p.category))]

  let filtered = products.filter(p =>
    (!query || p.name.includes(query) || p.description?.includes(query)) &&
    (category === 'الكل' || p.category === category)
  )

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ar'))

  return (
    <div>
      <h2 className="font-black text-blue-900 mb-4 text-base">💊 جميع المنتجات ({filtered.length})</h2>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input className="inp" style={{ maxWidth: 320 }} placeholder="🔍 ابحث باسم الدواء..."
          value={query} onChange={e => setQuery(e.target.value)} />
        <select className="inp" style={{ maxWidth: 160 }} value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="inp" style={{ maxWidth: 160 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="default">الترتيب الافتراضي</option>
          <option value="price-asc">السعر: الأقل أولاً</option>
          <option value="price-desc">السعر: الأعلى أولاً</option>
          <option value="name">الاسم أبجدياً</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap border-2 cursor-pointer transition-all"
            style={{
              background: category === cat ? '#1565C0' : '#fff',
              color: category === cat ? '#fff' : '#64748B',
              borderColor: category === cat ? '#1565C0' : '#DBEAFE',
              fontFamily: 'inherit',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))' }}>
        {filtered.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 0.025} />)}
      </div>

      {/* WhatsApp CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 p-8 rounded-[2rem] text-center border-2 border-dashed border-blue-200 bg-blue-50/50"
      >
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-emerald-200">
          💬
        </div>
        <h3 className="font-black text-blue-900 text-lg mb-2">مش لاقي دواك؟</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          صور الروشتة أو علبة الدواء وابعتها لنا على واتساب وهنوفرها لك في أسرع وقت!
        </p>
        <a 
          href="https://wa.me/201273319681" 
          target="_blank" 
          rel="noreferrer"
          className="btn-green !py-3 !px-8 !rounded-xl inline-flex items-center gap-2 text-sm font-bold no-underline"
        >
          إرسال صورة الدواء (واتساب)
        </a>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">😔</p>
          <p className="font-semibold">لا توجد منتجات مطابقة</p>
        </div>
      )}
    </div>
  )
}
