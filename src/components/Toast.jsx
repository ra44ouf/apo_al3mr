// src/components/Toast.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../hooks/useStore'

export default function Toast() {
  const { toast } = useStore()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-2xl text-white font-bold text-sm"
          style={{
            background: toast.type === 'error' ? '#EF4444' : '#10B981',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            maxWidth: '90vw',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
