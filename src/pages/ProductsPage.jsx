// src/pages/ProductsPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, MessageCircle } from 'lucide-react'
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

  if (sortBy === 'price-asc')  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sortBy === 'name')       filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ar'))

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="font-black text-gray-900 text-xl mb-1">جميع المنتجات</h2>
        <p className="text-gray-400 text-sm">{filtered.length} منتج متاح</p>
      </div>

      {/* Filters bar */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input
            className="inp !pr-9"
            placeholder="ابحث باسم الدواء..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select
          className="inp"
          style={{ maxWidth: 150 }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="default">الترتيب الافتراضي</option>
          <option value="price-asc">السعر: الأقل أولاً</option>
          <option value="price-desc">السعر: الأعلى أولاً</option>
          <option value="name">الاسم أبجدياً</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-none"
            style={{
              background: category === cat ? '#0F3460' : '#fff',
              color: category === cat ? '#fff' : '#6B7280',
              border: `1px solid ${category === cat ? '#0F3460' : '#E5E7EB'}`,
              fontFamily: 'inherit',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))' }}>
          {filtered.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 0.025} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Search size={44} className="mx-auto mb-4 opacity-25" />
          <p className="font-bold text-base">لا توجد منتجات مطابقة</p>
          <p className="text-sm mt-1">جرب كلمة بحث مختلفة أو فئة أخرى</p>
        </div>
      )}

      {/* WhatsApp CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 rounded-2xl p-8 text-center"
        style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #BBF7D0' }}
      >
        <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
          <MessageCircle size={26} />
        </div>
        <h3 className="font-black text-emerald-900 text-lg mb-2">مش لاقي دواك؟</h3>
        <p className="text-emerald-700 text-sm mb-6 opacity-80">
          صور الروشتة أو علبة الدواء وابعتها لنا — هنوفرها لك في أسرع وقت
        </p>
        <a
          href="https://wa.me/201273319681"
          target="_blank"
          rel="noreferrer"
          className="btn-green !py-3 !px-8 !rounded-xl inline-flex items-center gap-2 no-underline"
        >
          <MessageCircle size={16} />
          إرسال صورة الدواء
        </a>
      </motion.div>
    </div>
  )
}
