// src/pages/admin/AdminDrugAPI.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Check, Loader, Pill, PenLine, X } from 'lucide-react'
import { useStore } from '../../hooks/useStore'

const QUICK_TERMS = [
  'aspirin', 'paracetamol', 'amoxicillin', 'metformin',
  'ibuprofen', 'omeprazole', 'lisinopril', 'atorvastatin',
  'cetirizine', 'azithromycin',
]

function inferCategory(name = '') {
  const n = name.toLowerCase()
  if (/aspirin|ibuprofen|paracetamol|acetaminophen|naproxen|fever|analg/.test(n)) return 'مسكنات'
  if (/cillin|mycin|cycline|floxacin|zithro|azithro|antibiotic/.test(n)) return 'مضادات حيوية'
  if (/omeprazole|pantoprazole|ranitidine|antacid|gastro/.test(n)) return 'هضمي'
  if (/vitamin|zinc|magnesium|calcium|iron|omega|supplement/.test(n)) return 'فيتامينات'
  if (/cetirizine|loratadine|fexofenadine|antihistamine|allegra/.test(n)) return 'حساسية'
  if (/metformin|glipizide|insulin|gliclazide|sitagliptin|diabet/.test(n)) return 'سكري'
  if (/statin|atorvastatin|simvastatin|lisinopril|amlodipine|valsartan|cardio/.test(n)) return 'قلب وأوعية'
  if (/cream|gel|lotion|derma|clotrimazole|skin/.test(n)) return 'جلدية'
  return 'عام'
}

async function fetchRxImage(rxcui) {
  try {
    const r = await fetch(`https://rximage.nlm.nih.gov/api/rximage/1/rxbase?rxcui=${rxcui}`)
    const d = await r.json()
    return d.nlmRxImages?.[0]?.imageUrl || null
  } catch { return null }
}

// ── RxNorm search ─────────────────────────────────────
async function searchRxNorm(term) {
  const res = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(term)}`)
  const data = await res.json()
  const groups = data.drugGroup?.conceptGroup || []
  const priority = ['SBD', 'SCD', 'BN', 'IN', 'PIN']
  const seen = new Set()
  const parsed = []

  for (const tty of priority) {
    const group = groups.find(g => g.tty === tty)
    if (!group?.conceptProperties) continue
    for (const drug of group.conceptProperties) {
      if (seen.has(drug.rxcui) || seen.has(drug.name)) continue
      seen.add(drug.rxcui)
      seen.add(drug.name)
      parsed.push({ rxcui: drug.rxcui, name: drug.name, synonym: drug.synonym, tty, imageUrl: null, source: 'rxnorm' })
      if (parsed.length >= 15) break
    }
    if (parsed.length >= 15) break
  }
  return parsed
}

// ── OpenFDA fallback search ───────────────────────────
async function searchOpenFDA(term) {
  const res = await fetch(
    `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(term)}&limit=10`
  )
  if (!res.ok) return []
  const data = await res.json()
  const results = data.results || []
  return results.map((r, i) => {
    const brand   = r.openfda?.brand_name?.[0]
    const generic = r.openfda?.generic_name?.[0]
    const name    = brand || generic || term
    const desc    = (r.purpose?.[0] || r.indications_and_usage?.[0] || '')
      .replace(/<[^>]*>/g, '').slice(0, 80)
    return {
      rxcui: `fda-${i}-${name}`,
      name,
      synonym: generic && brand ? generic : '',
      tty: 'FDA',
      imageUrl: null,
      source: 'fda',
      description: desc,
    }
  })
}

// ── Manual Add Modal ──────────────────────────────────
function ManualAddModal({ initialName, onClose, onAdd }) {
  const [form, setForm] = useState({
    name: initialName, price: '', stock: '',
    category: inferCategory(initialName), description: '', image_url: '',
  })
  const up = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const submit = () => {
    if (!form.name || !form.price) return
    onAdd({ ...form, price: +form.price, stock: +form.stock || 0 })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="card w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-5 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
          <h3 className="font-black text-gray-900 text-sm">إضافة دواء يدوياً</h3>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-gray-400"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <input className="inp" placeholder="اسم الدواء *" value={form.name} onChange={up('name')} />
          <div className="grid grid-cols-2 gap-3">
            <input className="inp" type="number" placeholder="السعر (ج.م) *" value={form.price} onChange={up('price')} />
            <input className="inp" type="number" placeholder="الكمية" value={form.stock} onChange={up('stock')} />
          </div>
          <input className="inp" placeholder="التصنيف" value={form.category} onChange={up('category')} />
          <input className="inp" placeholder="رابط صورة (اختياري)" value={form.image_url} onChange={up('image_url')} />
          <textarea className="inp" placeholder="الوصف (اختياري)" rows={2} value={form.description} onChange={up('description')} style={{ resize: 'vertical' }} />
          <div className="flex gap-3 justify-end mt-1">
            <button onClick={onClose} className="btn-secondary">إلغاء</button>
            <button onClick={submit} className="btn-primary">إضافة</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────
export default function AdminDrugAPI() {
  const { addProduct, products, showToast } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState({})
  const [imgLoading, setImgLoading] = useState({})
  const [showManual, setShowManual] = useState(false)
  const [noResultsFor, setNoResultsFor] = useState('')

  const search = async (term = query) => {
    const q = term.trim()
    if (!q) return
    setLoading(true)
    setResults([])
    setNoResultsFor('')

    try {
      // 1️⃣ جرّب RxNorm أولاً
      let parsed = await searchRxNorm(q)

      // 2️⃣ fallback لـ OpenFDA لو RxNorm ما رجعش نتائج
      if (parsed.length === 0) {
        parsed = await searchOpenFDA(q)
      }

      if (parsed.length === 0) {
        setNoResultsFor(q)
        showToast('لا توجد نتائج — يمكنك إضافة الدواء يدوياً', 'error')
        setLoading(false)
        return
      }

      setResults(parsed)

      // تحميل صور فقط لنتائج RxNorm (لها rxcui حقيقي)
      const rxnormResults = parsed.filter(d => d.source === 'rxnorm')
      if (rxnormResults.length > 0) {
        setImgLoading(Object.fromEntries(rxnormResults.map(d => [d.rxcui, true])))
        rxnormResults.forEach(async (drug, idx) => {
          const url = await fetchRxImage(drug.rxcui)
          setResults(prev => prev.map(d => d.rxcui === drug.rxcui ? { ...d, imageUrl: url } : d))
          setImgLoading(prev => ({ ...prev, [drug.rxcui]: false }))
        })
      }
    } catch {
      showToast('خطأ في الاتصال — تحقق من الإنترنت', 'error')
    }
    setLoading(false)
  }

  const alreadyInStore = key => products.some(p => p.name === key)

  const handleAdd = (drug) => {
    const key = drug.rxcui
    if (added[key] || alreadyInStore(drug.name)) return
    addProduct({
      name: drug.name,
      price: Math.floor(Math.random() * 90 + 15),
      stock: Math.floor(Math.random() * 100 + 20),
      category: inferCategory(drug.name),
      icon: '💊',
      description: drug.description || (drug.synonym ? drug.synonym : ''),
      image_url: drug.imageUrl || null,
    })
    setAdded(a => ({ ...a, [key]: true }))
    showToast(`تمت إضافة ${drug.name}`)
  }

  const handleManualAdd = (prod) => {
    addProduct(prod)
    showToast(`تمت إضافة ${prod.name}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-black text-gray-900 text-sm mb-1">بحث في قاعدة بيانات الأدوية العالمية</h3>
        <p className="text-gray-400 text-xs">
          RxNorm (NLM) + OpenFDA كـ fallback — أكثر من 100,000 دواء مع صور تلقائية
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 max-w-xl mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input
            className="inp !pr-9"
            placeholder="aspirin, Contafever, amoxicillin..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
          />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => search()}
          disabled={loading}
          className="btn-primary !px-6 whitespace-nowrap flex items-center gap-2">
          {loading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
          {loading ? 'بحث...' : 'بحث'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowManual(true)}
          className="btn-secondary !px-4 whitespace-nowrap flex items-center gap-1.5 !text-xs">
          <PenLine size={13} />
          يدوي
        </motion.button>
      </div>

      {/* Quick terms */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {QUICK_TERMS.map(t => (
          <button key={t} onClick={() => { setQuery(t); search(t) }}
            className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all border-none font-semibold"
            style={{ background: '#EEF2FF', color: '#4F46E5', fontFamily: 'inherit' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block mb-4">
            <Loader size={38} color="#0F3460" />
          </motion.div>
          <p className="text-gray-500 font-semibold text-sm">جاري البحث...</p>
        </div>
      )}

      {/* No results → manual add prompt */}
      {!loading && noResultsFor && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 text-center"
          style={{ background: '#FFFBEB', border: '1px solid #FCD34D' }}>
          <Pill size={40} color="#F59E0B" className="mx-auto mb-3 opacity-60" />
          <p className="font-black text-amber-800 mb-1">لم يُعثر على "{noResultsFor}"</p>
          <p className="text-amber-700 text-sm mb-5 opacity-80">
            هذا الاسم غير موجود في قواعد البيانات العالمية (قد يكون اسماً تجارياً محلياً)
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowManual(true)}
            className="btn-primary flex items-center gap-2 mx-auto">
            <PenLine size={15} />
            إضافة "{noResultsFor}" يدوياً
          </motion.button>
        </motion.div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs text-gray-400 font-semibold">{results.length} نتيجة</p>
            {results[0]?.source === 'fda' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: '#FEF3C7', color: '#92400E' }}>
                OpenFDA
              </span>
            )}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
            {results.map((drug, i) => {
              const isAdded = !!added[drug.rxcui] || alreadyInStore(drug.name)
              const imgSpinning = imgLoading[drug.rxcui]

              return (
                <motion.div key={drug.rxcui + i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card overflow-hidden">

                  {/* Image */}
                  <div className="relative flex items-center justify-center" style={{ height: 110, background: '#F8FAFC' }}>
                    {imgSpinning ? (
                      <Loader size={18} color="#CBD5E1" className="animate-spin" />
                    ) : drug.imageUrl ? (
                      <img src={drug.imageUrl} alt={drug.name}
                        className="w-full h-full object-contain p-3"
                        onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <Pill size={32} strokeWidth={1} color="#CBD5E1" />
                    )}
                    <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: drug.source === 'fda' ? '#FEF3C7' : '#EEF2FF', color: drug.source === 'fda' ? '#92400E' : '#4F46E5' }}>
                      {drug.tty}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="font-bold text-gray-800 text-sm leading-tight mb-0.5 line-clamp-2">{drug.name}</p>
                    {drug.synonym && drug.synonym !== drug.name && (
                      <p className="text-xs text-gray-400 mb-1">{drug.synonym}</p>
                    )}
                    <p className="text-[11px] text-indigo-500 font-semibold mb-3">{inferCategory(drug.name)}</p>
                    <motion.button
                      whileHover={{ scale: isAdded ? 1 : 1.02 }}
                      whileTap={{ scale: isAdded ? 1 : 0.97 }}
                      onClick={() => handleAdd(drug)}
                      disabled={isAdded}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
                      style={{
                        background: isAdded ? '#F0FDF4' : '#0F3460',
                        color: isAdded ? '#16A34A' : '#fff',
                        cursor: isAdded ? 'default' : 'pointer',
                      }}>
                      {isAdded ? <Check size={13} /> : <Plus size={13} />}
                      {isAdded ? 'تمت الإضافة' : 'أضف للمتجر'}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showManual && (
          <ManualAddModal
            initialName={noResultsFor || query}
            onClose={() => setShowManual(false)}
            onAdd={handleManualAdd}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
