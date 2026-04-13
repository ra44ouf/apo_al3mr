// src/pages/AuthPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../hooks/useStore'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', pass: '', name: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const { login, register } = useStore()

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const submit = async () => {
    setError('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email || !emailRegex.test(form.email)) {
      return setError('خطأ: يرجى كتابة بريد إلكتروني صحيح (مثال: ahmed@gmail.com)')
    }

    if (mode === 'login') {
      const err = await login(form.email, form.pass)
      if (err) setError(err)
    } else {
      if (!form.name || !form.email || !form.pass) return setError('الرجاء تعبئة الحقول المطلوبة *')
      if (form.pass.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      const err = await register(form)
      if (err) setError(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #EFF6FF 60%, #DBEAFE)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-sm p-7"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>⊕</div>
          <h1 className="font-black text-blue-900 text-lg">صيدلية أبو العمر</h1>
          <p className="text-slate-400 text-xs mt-1">رعاية صحية من قلبنا إليك</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-blue-50 rounded-xl p-1 mb-5">
          {[['login','تسجيل الدخول'],['register','حساب جديد']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              className="flex-1 py-2 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
              style={{
                background: mode === m ? '#1565C0' : 'transparent',
                color: mode === m ? '#fff' : '#64748B',
                fontFamily: 'inherit',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {mode === 'register' && (
            <input className="inp" placeholder="الاسم الكامل *" value={form.name} onChange={update('name')} />
          )}
          <input className="inp" type="email" placeholder="البريد الإلكتروني *" value={form.email} onChange={update('email')} />
          <input className="inp" type="password" placeholder="كلمة المرور *" value={form.pass} onChange={update('pass')}
            onKeyDown={e => e.key === 'Enter' && submit()} />
          {mode === 'register' && (
            <>
              <input className="inp" placeholder="رقم الهاتف" value={form.phone} onChange={update('phone')} />
              <input className="inp" placeholder="العنوان" value={form.address} onChange={update('address')} />
            </>
          )}
        </div>

        {error && <p className="text-red-500 text-xs mt-2.5 font-semibold">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          className="btn-primary w-full mt-4 py-3 text-center justify-center flex"
          style={{ borderRadius: 12 }}
        >
          {mode === 'login' ? 'دخول ←' : 'إنشاء حساب ←'}
        </motion.button>

        {mode === 'login' && (
          <p className="text-center text-xs text-slate-400 mt-3">
            تجريبي: admin@pharmacy.com / admin123
          </p>
        )}
      </motion.div>
    </div>
  )
}
