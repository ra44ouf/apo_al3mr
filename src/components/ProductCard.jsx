// src/components/ProductCard.jsx
import { motion } from 'framer-motion'
import { useStore } from '../hooks/useStore'

export default function ProductCard({ product, delay = 0 }) {
  const { addToCart, toggleFavorite, favorites } = useStore()
  const isFav = favorites.includes(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="card p-4 flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: '#EFF6FF' }}>
          {product.icon || '💊'}
        </div>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleFavorite(product.id)}
          className="p-1.5 rounded-xl border-none bg-transparent cursor-pointer text-lg"
        >
          {isFav ? '❤️' : '🤍'}
        </motion.button>
      </div>

      {/* Info */}
      <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1">{product.name}</h3>
      <p className="text-slate-500 text-xs mb-3 flex-1 leading-relaxed">{product.description}</p>

      {/* Category badge */}
      <span className="badge mb-3" style={{ background: '#EFF6FF', color: '#1565C0' }}>
        {product.category}
      </span>

      {/* Price + Add */}
      <div className="flex items-center justify-between">
        <span className="text-base font-black text-blue-700">{product.price} ج.م</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary !py-1.5 !px-3 !text-xs"
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'نفذ' : '+ سلة'}
        </motion.button>
      </div>

      {/* Low stock warning */}
      {product.stock > 0 && product.stock <= 10 && (
        <p className="text-red-500 text-xs mt-2 font-semibold">⚠️ كمية محدودة ({product.stock} متبقي)</p>
      )}
      {product.stock === 0 && (
        <p className="text-red-500 text-xs mt-2 font-semibold">❌ غير متوفر حالياً</p>
      )}
    </motion.div>
  )
}
