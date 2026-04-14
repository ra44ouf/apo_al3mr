// src/pages/HomePage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Thermometer, ShieldCheck, Heart, Sun, Wind,
  Pill, Droplets, Activity, Package, ChevronLeft, MessageCircle,
} from 'lucide-react'
import { useStore } from '../hooks/useStore'
import ProductCard from '../components/ProductCard'

const CATEGORY_ICONS = {
  'مسكنات': Thermometer,
  'مضادات حيوية': ShieldCheck,
  'هضمي': Heart,
  'فيتامينات': Sun,
  'حساسية': Wind,
  'قلب وأوعية': Heart,
  'جلدية': Droplets,
  'سكري': Activity,
  'مكملات': Package,
  'عام': Pill,
}

function CategoryChip({ cat, active, onClick }) {
  const Icon = CATEGORY_ICONS[cat] || Pill
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-none cursor-pointer transition-all whitespace-nowrap"
      style={{
        background: active ? '#0F3460' : '#fff',
        color: active ? '#fff' : '#374151',
        border: `1px solid ${active ? '#0F3460' : '#E5E7EB'}`,
        minWidth: 72,
        fontFamily: 'inherit',
      }}
    >
      <Icon size={18} strokeWidth={1.8} />
      <span className="text-xs font-bold">{cat}</span>
    </motion.button>
  )
}

function PromoCard({ title, subtitle, bg, textColor = '#fff' }) {
  const navigate = useNavigate()
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/products')}
      className="rounded-2xl p-6 cursor-pointer overflow-hidden relative"
      style={{ background: bg, minHeight: 160 }}
    >
      <div className="relative z-10">
        <h3 className="font-black text-lg leading-tight mb-1" style={{ color: textColor }}>{title}</h3>
        <p className="text-sm mb-4 opacity-80" style={{ color: textColor }}>{subtitle}</p>
        <span
          className="text-xs font-bold px-4 py-2 rounded-lg inline-block"
          style={{ background: 'rgba(255,255,255,0.2)', color: textColor, border: '1px solid rgba(255,255,255,0.3)' }}
        >
          تسوق الآن
        </span>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15"
        style={{ background: '#fff' }} />
    </motion.div>
  )
}

export default function HomePage() {
  const { user, products } = useStore()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('الكل')
  const navigate = useNavigate()

  const categories = ['الكل', ...new Set(products.map(p => p.category))]

  const featured = products.filter(p =>
    (activeCategory === 'الكل' || p.category === activeCategory) &&
    (!query || p.name.includes(query) || p.description?.includes(query) || p.category.includes(query))
  ).slice(0, 8)

  return (
    <div>
      {/* ── Hero ── */}
      <div className="rounded-2xl mb-8 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0F3460 0%, #1a4a7a 60%, #1565C0 100%)', minHeight: 200 }}>
        {/* Decorative circles */}
        <div className="absolute rounded-full opacity-10" style={{ width: 300, height: 300, background: '#fff', top: -80, right: -60 }} />
        <div className="absolute rounded-full opacity-5"  style={{ width: 180, height: 180, background: '#fff', bottom: -40, left: 40 }} />

        <div className="relative z-10 p-8">
          <p className="text-blue-200 text-sm mb-1.5">
            مرحباً بك، <span className="font-bold text-white">{user?.name}</span>
          </p>
          <h1 className="text-white font-black leading-tight mb-2"
            style={{ fontSize: 'clamp(1.25rem, 3vw, 1.9rem)' }}>
            صحتك أولويتنا<br />أدوية أصيلة بضغطة واحدة
          </h1>
          <p className="text-blue-200 text-xs mb-6">
            توصيل سريع · أسعار تنافسية · أكثر من {products.length} منتج
          </p>

          {/* Search bar */}
          <div className="flex gap-2.5 max-w-lg">
            <div className="relative flex-1">
              <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
              <input
                className="w-full py-3 pl-4 pr-10 rounded-xl text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.95)', border: 'none', fontFamily: 'inherit' }}
                placeholder="ابحث عن دواء أو منتج..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && navigate('/products')}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/products')}
              className="bg-white text-[#0F3460] font-bold px-5 rounded-xl text-sm border-none cursor-pointer whitespace-nowrap"
            >
              عرض الكل
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900 text-base">تصفح حسب الفئة</h2>
          <button onClick={() => navigate('/products')}
            className="flex items-center gap-1 text-xs text-[#0F3460] font-bold border-none bg-transparent cursor-pointer">
            عرض الكل <ChevronLeft size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <CategoryChip
              key={cat}
              cat={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* ── Promo Banners ── */}
      {!query && activeCategory === 'الكل' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <PromoCard title="مسكنات الألم" subtitle="تخلص من الألم بسرعة" bg="linear-gradient(135deg,#E63946,#c0392b)" />
          <PromoCard title="فيتامينات ومكملات" subtitle="عزز مناعتك يومياً" bg="linear-gradient(135deg,#0F3460,#1565C0)" />
          <PromoCard title="رعاية مستمرة" subtitle="اطلب عبر واتساب 24/7" bg="linear-gradient(135deg,#059669,#10B981)" />
        </div>
      )}

      {/* ── Featured Products ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900 text-base">
            {query
              ? `نتائج البحث (${featured.length})`
              : activeCategory === 'الكل' ? 'منتجات مميزة' : activeCategory}
          </h2>
          {!query && (
            <button onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-xs text-[#0F3460] font-bold border-none bg-transparent cursor-pointer">
              عرض الكل <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))' }}>
            {featured.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 0.04} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">لا توجد نتائج</p>
            <p className="text-xs mt-1">جرب كلمة بحث أخرى</p>
          </div>
        )}
      </div>

      {/* ── WhatsApp CTA ── */}
      {!query && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 text-center mb-4"
          style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #BBF7D0' }}
        >
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
            <MessageCircle size={26} />
          </div>
          <h3 className="font-black text-emerald-900 text-lg mb-1">مش لاقي دواك؟</h3>
          <p className="text-emerald-700 text-sm mb-6 opacity-80">
            ابعت صورة الروشتة أو الدواء وهنوفره لك في أسرع وقت — خدمة متاحة 24 ساعة
          </p>
          <a
            href="https://wa.me/201273319681"
            target="_blank"
            rel="noreferrer"
            className="btn-green !py-3 !px-10 !rounded-xl inline-flex items-center gap-2 no-underline"
          >
            <MessageCircle size={16} />
            تواصل عبر واتساب
          </a>
        </motion.div>
      )}
    </div>
  )
}
