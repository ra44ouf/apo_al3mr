// src/components/Landing.jsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// المسار الهندسي للثعبان ليطابق الصورة بالضبط: ينطلق من الأسفل لليمين، يتقاطع، يلتف عالياً يميناً، ثم يتدلى رأسه من اليسار
const SNAKE_PATH = "M 165 470 C 165 530 70 470 90 400 C 110 330 200 330 210 250 C 220 170 280 70 160 40 C 90 20 50 80 85 120"

export default function Landing({ onDone }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)   // Phase 1: رسم العصا
    const t2 = setTimeout(() => setPhase(2), 1200)  // Phase 2: الكأس والثعبان
    const t3 = setTimeout(() => setPhase(3), 3000)  // Phase 3: ظهور الاسم العريض أمام الشعار
    const t4 = setTimeout(() => setPhase(4), 5200)  // Phase 4: تلاشي وانتقال
    const t5 = setTimeout(() => onDone(), 6000)     // الدخول
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [onDone])

  // التحديد الأبيض القوي للنص ليفصله بوضوح عن العصا الموجودة بالخلف
  const textOutline = '3px 3px 0 #FFF, -3px -3px 0 #FFF, 3px -3px 0 #FFF, -3px 3px 0 #FFF, 0px 3px 0 #FFF, 0px -3px 0 #FFF, 3px 0px 0 #FFF, -3px 0px 0 #FFF, 0 8px 30px rgba(255,255,255,1)'

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white z-[9999]"
      style={{ background: '#FFFFFF' }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@800;900&family=Noto+Kufi+Arabic:wght@800;900&display=swap');`}
      </style>

      {/* Subtle light background pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 && phase < 4 ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(21,101,192,0.06) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      <motion.div
        className="relative flex flex-col items-center select-none w-full h-[600px] justify-center"
        initial={{ opacity: 1, scale: 1, y: 0 }}
        animate={
          phase === 4
            ? { opacity: 0, scale: 0.85, y: -40, filter: 'blur(4px)' }
            : {}
        }
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Phase 1 & 2: Medical SVG Symbol */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-10%' }}>
          <svg 
            width="320" 
            height="520" 
            viewBox="0 0 300 500" 
            className="z-10 overflow-visible" 
            style={{ filter: 'drop-shadow(0 6px 12px rgba(21,101,192,0.15))' }}
          >
            {/* 1. Rod */}
            <motion.line
              x1="150" y1="490" x2="150" y2="40"
              stroke="#1565C0" strokeWidth="18" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* 2. Pharmacy Bowl */}
            {/* نصف دائرة مثالية لتمثيل الكأس */}
            <motion.path
              d="M 80 180 A 70 70 0 0 0 220 180 Z"
              fill="#1565C0"
              style={{ originX: '150px', originY: '180px' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            />
            
            <motion.text
              x="150" y="202" textAnchor="middle"
              fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily='"Noto Kufi Arabic", "Cairo", sans-serif'
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 5 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              صيدليات
            </motion.text>

            {/* 3. Snake Body Coiling */}
            {/* Outline الأبيض لعمل فصل (Overlap Mask) في نقط التقاطع */}
            <motion.path
              d={SNAKE_PATH}
              stroke="#FFFFFF" fill="none" strokeWidth="28" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
            {/* جسم الثعبان الأزرق */}
            <motion.path
              d={SNAKE_PATH}
              stroke="#1565C0" fill="none" strokeWidth="16" strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />

            {/* Snake Details (Eye & Tongue) */}
            <motion.circle
              cx="80" cy="115" r="2.5" fill="#FFFFFF"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0 }}
              transition={{ delay: 1.6, duration: 0.3 }}
            />
            <motion.path
              d="M 88 123 L 96 135 L 102 133 M 96 135 L 98 140"
              stroke="#1565C0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: phase >= 2 ? 1 : 0, opacity: phase >= 2 ? 1 : 0 }}
              transition={{ delay: 1.7, duration: 0.2 }}
            />
          </svg>
        </div>

        {/* Phase 3: Typographic Reveal "أبو العمرو" */}
        {/* متطابقة مع الشعار بحيث تقطع النص العريض على العصا في الخلفية */}
        <div 
          dir="rtl" 
          className="relative z-20 flex flex-col items-start mx-auto pointer-events-none" 
          style={{ width: 'fit-content', marginTop: '130px' }}
        >
          <motion.div
             style={{ 
               fontSize: 'clamp(2rem, 7vw, 3.5rem)', 
               fontWeight: 900, 
               lineHeight: 0.7, 
               marginRight: '8%', // موازنة تموضع كلمة "أبو" أعلى حرف "ر"
               color: '#1565C0',
               textShadow: textOutline,
               fontFamily: '"Noto Kufi Arabic", "Cairo", sans-serif'
             }}
             initial={{ opacity: 0, y: -15 }}
             animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : -15 }}
             transition={{ duration: 0.6 }}
          >
             أبو
          </motion.div>
          <motion.div
             style={{ 
               fontSize: 'clamp(5rem, 16vw, 10rem)', 
               fontWeight: 900, 
               lineHeight: 1.1, 
               letterSpacing: '-0.02em', 
               paddingBottom: '10px',
               color: '#1565C0',
               textShadow: textOutline,
               fontFamily: '"Noto Kufi Arabic", "Cairo", sans-serif'
             }}
             initial={{ opacity: 0, clipPath: 'inset(0 0 0 100%)' }}
             animate={{
               opacity: phase >= 3 ? 1 : 0,
               clipPath: phase >= 3 ? 'inset(0 0 0 0%)' : 'inset(0 0 0 100%)'
             }}
             transition={{ duration: 1.3, delay: 0.2, ease: "easeOut" }}
          >
             العمرو
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
