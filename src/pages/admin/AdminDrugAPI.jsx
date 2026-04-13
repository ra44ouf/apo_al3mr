// src/pages/admin/AdminDrugAPI.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../hooks/useStore'

export default function AdminDrugAPI() {
  const { addProduct, products, showToast } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState({})

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResults([])
    try {
      const res = await fetch(
        `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=12`
      )
      const data = await res.json()
      setResults(data.results || [])
      if (!data.results?.length) showToast('لا توجد نتائج — جرب: aspirin, metformin, ibuprofen', 'error')
    } catch {
      showToast('خطأ في الاتصال بـ FDA API', 'error')
    }
    setLoading(false)
  }

  const handleAdd = (result) => {
    const brand = result.openfda?.brand_name?.[0]
    const generic = result.openfda?.generic_name?.[0]
    const name = brand || generic || 'Unknown Drug'
    if (added[name]) return

    const category = result.openfda?.pharm_class_cs?.[0]
      ?.split('[')[0]?.trim()?.slice(0, 25) || 'عام'
    const description = (
      result.purpose?.[0] ||
      result.indications_and_usage?.[0] ||
      result.description?.[0] ||
      ''
    ).replace(/<[^>]*>/g, '').slice(0, 100)

    addProduct({
      name,
      price: Math.floor(Math.random() * 80 + 15),
      stock: Math.floor(Math.random() * 100 + 20),
      category,
      icon: '💊',
      description,
    })
    setAdded(a => ({ ...a, [name]: true }))
  }

  const alreadyInStore = (result) => {
    const name = result.openfda?.brand_name?.[0] || result.openfda?.generic_name?.[0]
    return products.some(p => p.name === name)
  }

  return (
    <div>
      <div className="mb-5">
        <h3 className="font-black text-blue-900 text-sm mb-1">🔎 بحث في قاعدة بيانات FDA الأمريكية</h3>
        <p className="text-slate-500 text-xs mb-4">ابحث عن أي دواء وأضفه مباشرة لمتجرك — أكثر من 100,000 دواء</p>

        <div className="flex gap-3 max-w-lg">
          <input
            className="inp flex-1"
            placeholder="aspirin, ibuprofen, metformin, amoxicillin..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={search}
            disabled={loading}
            className="btn-primary !px-5 whitespace-nowrap"
          >
            {loading ? '...' : 'بحث 🔍'}
          </motion.button>
        </div>

        {/* Quick suggestions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {['aspirin', 'metformin', 'lisinopril', 'atorvastatin', 'omeprazole', 'amoxicillin'].map(s => (
            <button key={s} onClick={() => { setQuery(s); }}
              className="text-xs px-3 py-1 rounded-full border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
              style={{ fontFamily: 'inherit' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-5xl inline-block mb-4">⊕
          </motion.div>
          <p className="text-blue-700 font-bold text-sm">جاري البحث في FDA...</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <p className="text-xs text-slate-400 mb-3 font-semibold">{results.length} نتيجة من FDA</p>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
            {results.map((r, i) => {
              const brand = r.openfda?.brand_name?.[0]
              const generic = r.openfda?.generic_name?.[0]
              const name = brand || generic || 'Unknown Drug'
              const desc = (r.purpose?.[0] || r.indications_and_usage?.[0] || '')
                .replace(/<[^>]*>/g, '').slice(0, 110)
              const mfr = r.openfda?.manufacturer_name?.[0]?.slice(0, 40)
              const isAdded = !!added[name] || alreadyInStore(r)

              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-4"
                >
                  <div className="flex gap-2.5 items-start mb-2.5">
                    <span className="text-xl mt-0.5">💊</span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{name}</p>
                      {generic && brand && (
                        <p className="text-xs text-slate-400 mt-0.5">{generic}</p>
                      )}
                    </div>
                  </div>
                  {desc && <p className="text-xs text-slate-500 mb-2.5 leading-relaxed">{desc}...</p>}
                  {mfr && <p className="text-xs text-slate-400 mb-3">🏭 {mfr}</p>}
                  <motion.button
                    whileHover={{ scale: isAdded ? 1 : 1.02 }}
                    whileTap={{ scale: isAdded ? 1 : 0.97 }}
                    onClick={() => handleAdd(r)}
                    disabled={isAdded}
                    className={isAdded ? 'btn-secondary !py-1.5 !px-3 !text-xs' : 'btn-primary !py-1.5 !px-3 !text-xs'}
                  >
                    {isAdded ? '✓ تمت الإضافة' : '+ أضف للمتجر'}
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
