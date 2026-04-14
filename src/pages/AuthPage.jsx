// src/pages/AuthPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader, Eye, EyeOff } from 'lucide-react'
import { useStore } from '../hooks/useStore'

export default function AuthPage() {
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ email: '', pass: '', name: '', phone: '', address: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login, register }   = useStore()

  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const submit = async () => {
    setError('')
    if (!form.email) return setError('يرجى إدخال البريد الإلكتروني')
    if (!form.pass)  return setError('يرجى إدخال كلمة المرور')

    if (mode === 'register') {
      if (!form.name)         return setError('يرجى إدخال الاسم الكامل')
      if (form.pass.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const err = await login(form.email.trim(), form.pass)
        if (err) setError(err)
      } else {
        const err = await register(form)
        if (err) setError(err)
      }
    } catch (e) {
      setError('حدث خطأ في الاتصال — تحقق من الإنترنت وحاول مجدداً')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg,#F8FAFC 60%,#EEF2FF)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="card w-full max-w-sm p-7"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="صيدلية أبو العمر"
            className="w-20 h-20 rounded-2xl object-contain mx-auto mb-3"
            style={{ background: '#fff' }}
          />
          <h1 className="font-black text-gray-900 text-lg">صيدلية أبو العمر</h1>
          <p className="text-gray-400 text-xs mt-1">رعاية صحية من قلبنا إليك</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: '#F3F4F6' }}>
          {[['login','تسجيل الدخول'],['register','حساب جديد']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              className="flex-1 py-2 rounded-lg text-xs font-bold border-none cursor-pointer transition-all"
              style={{
                background: mode === m ? '#0F3460' : 'transparent',
                color: mode === m ? '#fff' : '#6B7280',
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

          <input
            className="inp"
            type="text"
            inputMode="email"
            placeholder="البريد الإلكتروني *"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
            dir="ltr"
            style={{ textAlign: 'left' }}
          />

          <div className="relative">
            <input
              className="inp !pl-10"
              type={showPass ? 'text' : 'password'}
              placeholder="كلمة المرور *"
              value={form.pass}
              onChange={update('pass')}
              onKeyDown={e => e.key === 'Enter' && !loading && submit()}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0"
            >
              {showPass ? <EyeOff size={16} color="#9CA3AF" /> : <Eye size={16} color="#9CA3AF" />}
            </button>
          </div>

          {mode === 'register' && (
            <>
              <input className="inp" placeholder="رقم الهاتف" value={form.phone} onChange={update('phone')} />
              <input className="inp" placeholder="العنوان" value={form.address} onChange={update('address')} />
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-3 font-semibold p-3 rounded-lg"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          onClick={submit}
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 border-none cursor-pointer transition-all"
          style={{
            background: loading ? '#6B7280' : '#0F3460',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              جاري التحقق...
            </>
          ) : (
            mode === 'login' ? 'دخول' : 'إنشاء حساب'
          )}
        </motion.button>

        {mode === 'login' && (
          <p className="text-center text-xs text-gray-400 mt-3">
            تجريبي: <span className="font-bold" dir="ltr">admin@pharmacy.com</span> / admin123
          </p>
        )}
      </motion.div>
    </div>
  )
}
