// src/pages/HomePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useStore } from '../hooks/useStore'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  const { user, products, addToCart, toggleFavorite, favorites } = useStore()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const categories = [...new Set(products.map(p => p.category))]
  const featured = query
    ? products.filter(p => p.name.includes(query) || p.description.includes(query) || p.category.includes(query))
    : products.slice(0, 8)

  return (
    <div>
      {/* Hero */}
      <div className="rounded-3xl p-7 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0D47A1,#1565C0 45%,#1E88E5)' }}>
        <div className="absolute rounded-full border border-white/5"
          style={{ width: 320, height: 320, top: '-60%', left: '-8%' }} />
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">مرحباً، {user?.name} 👋</p>
          <h1 className="text-white font-black mb-2 leading-tight" style={{ fontSize: 'clamp(1.2rem,3vw,1.8rem)' }}>
            اعتنِ بصحتك مع<br />صيدلية أبو العمر
          </h1>
          <p className="text-white/60 text-xs mb-5">أدوية أصلية · توصيل سريع · أسعار تنافسية</p>
          <div className="flex gap-2.5 max-w-lg">
            <input
              className="inp flex-1"
              style={{ background: 'rgba(255,255,255,0.95)', border: 'none' }}
              placeholder="🔍 ابحث عن دواء..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/products')}
              className="bg-white text-blue-700 font-bold px-4 rounded-xl text-sm border-none cursor-pointer"
            >
              الكل
            </motion.button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 flex-wrap">
        {categories.map(cat => (
          <motion.button key={cat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/products')}
            className="bg-white border-2 border-blue-100 rounded-full px-3.5 py-1.5 text-xs font-bold text-blue-700 whitespace-nowrap cursor-pointer hover:border-blue-300 transition-all"
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Featured section */}
      <h2 className="font-extrabold text-slate-900 mb-4 text-base">
        {query ? `نتائج البحث (${featured.length})` : 'منتجات مميزة ✨'}
      </h2>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))' }}>
        {featured.map((p, i) => (
          <ProductCard key={p.id} product={p} delay={i * 0.04} />
        ))}
      </div>

      {featured.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">لا توجد نتائج للبحث</p>
        </div>
      )}

      {!query && (
        <>
          <div className="text-center mt-6 mb-12">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/products')}
              className="btn-secondary px-8 py-3">
              عرض جميع المنتجات ←
            </motion.button>
          </div>

          {/* WhatsApp CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-[2.5rem] text-center border-2 border-dashed border-emerald-200 bg-emerald-50/30 mb-10"
          >
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-emerald-100">
              📸
            </div>
            <h3 className="font-black text-emerald-900 text-lg mb-1">مش لاقي دواك؟ ابعت لنا صورته</h3>
            <p className="text-emerald-700/70 text-sm mb-6">
              خدمة طلب الأدوية عبر واتساب متاحة الآن 24 ساعة
            </p>
            <a 
              href="https://wa.me/201273319681" 
              target="_blank" 
              rel="noreferrer"
              className="btn-green !py-3 !px-10 !rounded-2xl inline-flex items-center gap-2 text-sm font-bold no-underline shadow-xl shadow-emerald-200 hover:shadow-emerald-300 transition-all"
            >
              اطلب الآن عبر واتساب 💬
            </a>
          </motion.div>
        </>
      )}
    </div>
  )
}
