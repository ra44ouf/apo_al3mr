// src/components/ProductCard.jsx
import { motion } from 'framer-motion'
import { Heart, Pill, ShoppingCart } from 'lucide-react'
import { useStore } from '../hooks/useStore'

export default function ProductCard({ product, delay = 0 }) {
  const { addToCart, toggleFavorite, favorites } = useStore()
  const isFav = favorites.includes(product.id)
  const outOfStock = product.stock === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="card flex flex-col overflow-hidden group"
    >
      {/* Image Area */}
      <div className="relative overflow-hidden flex items-center justify-center"
        style={{ height: 180, background: '#F8FAFC' }}>

        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={e => {
              e.target.style.display = 'none'
              e.target.parentElement.querySelector('.img-placeholder').style.display = 'flex'
            }}
          />
        ) : null}

        {/* Placeholder when no image */}
        <div
          className="img-placeholder absolute inset-0 flex items-center justify-center flex-col gap-2"
          style={{ display: product.image_url ? 'none' : 'flex' }}
        >
          <Pill size={48} strokeWidth={1} color="#CBD5E1" />
        </div>

        {/* Favorite button */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white flex items-center justify-center border-none cursor-pointer"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
        >
          <Heart
            size={15}
            strokeWidth={2}
            style={{
              color: isFav ? '#EF4444' : '#9CA3AF',
              fill: isFav ? '#EF4444' : 'none',
            }}
          />
        </motion.button>

        {/* Low stock badge */}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md"
            style={{ border: '1px solid #FCD34D' }}>
            متبقي {product.stock}
          </span>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-xs font-bold text-red-500 px-3 py-1 rounded-full bg-white"
              style={{ border: '1px solid #FCA5A5' }}>
              نفذ المخزون
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Category */}
        <span className="badge mb-2 self-start text-[11px]"
          style={{ background: '#EEF2FF', color: '#4F46E5' }}>
          {product.category}
        </span>

        {/* Name */}
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1"
          style={{ minHeight: '2.4em' }}>
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-400 text-xs mb-3 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price + button */}
        <div className="flex items-center justify-between mt-auto pt-2"
          style={{ borderTop: '1px solid #F3F4F6' }}>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-[#0F3460]">{product.price}</span>
            <span className="text-xs text-gray-400">ج.م</span>
          </div>
          <motion.button
            whileHover={{ scale: outOfStock ? 1 : 1.05 }}
            whileTap={{ scale: outOfStock ? 1 : 0.95 }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all"
            style={{
              background: outOfStock ? '#F3F4F6' : '#0F3460',
              color: outOfStock ? '#9CA3AF' : '#fff',
              cursor: outOfStock ? 'not-allowed' : 'pointer',
            }}
            onClick={() => !outOfStock && addToCart(product)}
            disabled={outOfStock}
          >
            {!outOfStock && <ShoppingCart size={12} />}
            {outOfStock ? 'نفذ' : 'أضف'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
