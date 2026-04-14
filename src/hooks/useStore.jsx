// src/hooks/useStore.jsx
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import {
  supabase,
  fetchProducts, insertProduct, updateProductInDB, deleteProductFromDB,
  signUpUser, signInUser, signOutUser, fetchProfile, updateProfile,
  insertOrder, fetchOrders, updateOrderStatusInDB,
  fetchAllProfiles, updateUserRole,
  deductStock, subscribeToOrders,
} from '../lib/supabase'

// ─── بيانات افتراضية ───────────────────────────────
const DEFAULT_PRODUCTS = [
  { id: '1', name: 'باراسيتامول 500mg', price: 15, stock: 100, category: 'مسكنات', icon: '💊', description: 'مسكن ألم وخافض حرارة فعّال ومأمون' },
  { id: '2', name: 'أموكسيسيلين 250mg', price: 45, stock: 60, category: 'مضادات حيوية', icon: '🔵', description: 'مضاد حيوي واسع الطيف للعدوى البكتيرية' },
  { id: '3', name: 'أوميبرازول 20mg', price: 35, stock: 80, category: 'هضمي', icon: '🟡', description: 'علاج حموضة المعدة وقرحة الاثني عشر' },
  { id: '4', name: 'فيتامين C 1000mg', price: 55, stock: 200, category: 'فيتامينات', icon: '🟠', description: 'تقوية المناعة ومضاد للأكسدة' },
  { id: '5', name: 'لوراتادين 10mg', price: 25, stock: 150, category: 'حساسية', icon: '🌸', description: 'مضاد هستامين لعلاج الحساسية الموسمية' },
  { id: '6', name: 'أتورفاستاتين 20mg', price: 70, stock: 75, category: 'قلب وأوعية', icon: '❤️', description: 'خفض الكولسترول وحماية القلب' },
  { id: '7', name: 'كريم كلوتريمازول', price: 30, stock: 120, category: 'جلدية', icon: '🧴', description: 'علاج الفطريات الجلدية والالتهابات' },
  { id: '8', name: 'فيتامين د3 1000IU', price: 45, stock: 180, category: 'فيتامينات', icon: '☀️', description: 'صحة العظام والمناعة ومستوى الطاقة' },
  { id: '9', name: 'ميتفورمين 500mg', price: 40, stock: 90, category: 'سكري', icon: '💙', description: 'تنظيم مستوى السكر في الدم' },
  { id: '10', name: 'إيبوبروفين 400mg', price: 20, stock: 140, category: 'مسكنات', icon: '💊', description: 'مضاد التهاب ومسكن ألم مزدوج التأثير' },
  { id: '11', name: 'زنك 50mg', price: 35, stock: 160, category: 'مكملات', icon: '🟢', description: 'دعم المناعة وتسريع التئام الجروح' },
  { id: '12', name: 'مغنيسيوم 250mg', price: 50, stock: 110, category: 'مكملات', icon: '⚪', description: 'تقليل التشنجات وتحسين جودة النوم' },
]

const ADMIN_LOCAL = {
  id: 'admin-001', email: 'admin@pharmacy.com', pass: 'admin123',
  name: 'أبو العمر', phone: '01273319681', address: 'مصر', role: 'admin',
}

// ─── Helper: LocalStorage ──────────────────────────
const ls = {
  get: (key, def) => { try { return JSON.parse(localStorage.getItem('ao_' + key)) ?? def } catch { return def } },
  set: (key, val) => localStorage.setItem('ao_' + key, JSON.stringify(val)),
}

// ─── Context ───────────────────────────────────────
export const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState(() => ls.get('products', DEFAULT_PRODUCTS))
  const [users, setUsers] = useState(() => ls.get('users', [ADMIN_LOCAL]))
  const [orders, setOrders] = useState(() => ls.get('orders', []))
  const [cart, setCart] = useState([])
  const [favorites, setFavorites] = useState(() => ls.get('favs', []))
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ─── بناء user object موحد من profile Supabase ──
  const buildUser = (sbUser, profile) => ({
    id: profile?.id || sbUser.id,       // UUID من Supabase
    supabaseId: sbUser.id,              // دائماً UUID أصلي
    email: profile?.email || sbUser.email,
    name: profile?.name || sbUser.email,
    phone: profile?.phone || '',
    address: profile?.address || '',
    role: profile?.role || 'user',
  })

  // ─── helper: promise مع timeout ────────────────────
  const withTimeout = (promise, ms, fallback = null) =>
    Promise.race([
      promise,
      new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
    ])

  // ─── Supabase Auth Listener ────────────────────────
  useEffect(() => {
    if (!supabase) {
      const cached = ls.get('user', null)
      if (cached) setUser(cached)
      setLoading(false)
      return
    }

    // safety: أقصى وقت انتظار 5 ثواني بغض النظر عن أي شيء
    const safetyTimeout = setTimeout(() => setLoading(false), 5000)

    const initAuth = async () => {
      try {
        // getSession مع timeout 4 ثواني
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          4000,
          { data: { session: null } }
        )
        const session = sessionResult?.data?.session
        if (session?.user) {
          // fetchProfile مع timeout 3 ثواني — لو ما ردش نبني user بدون profile
          const profile = await withTimeout(fetchProfile(session.user.id), 3000, null)
          setUser(buildUser(session.user, profile))
        }
      } catch (err) {
        console.error('Auth Init Error:', err)
      } finally {
        clearTimeout(safetyTimeout)
        setLoading(false)
      }
    }

    initAuth()

    // استماع للتغييرات
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          // fetchProfile مع timeout 3 ثواني — لو ما ردش نبني user بالبيانات الأساسية
          const profile = await withTimeout(fetchProfile(session.user.id), 3000, null)
          setUser(buildUser(session.user, profile))
        }
      } else {
        setUser(null)
      }
    })

    return () => { subscription.unsubscribe() }
  }, [])

  // ─── تحميل المنتجات ────────────────────────────────
  useEffect(() => {
    fetchProducts().then(data => {
      if (data && data.length > 0) {
        setProducts(data)
        ls.set('products', data)
      }
    })
  }, [])

  // ─── دالة مشتركة لجلب الطلبات وتحويلها ──────────────
  const loadOrders = useCallback(async (uid, isAdmin) => {
    const data = await fetchOrders(uid, isAdmin)
    if (!data) return
    const mapped = data.map(o => ({
      id: o.id,
      userId: o.user_id,
      userName: o.user_name,
      total: o.total_price,
      address: o.address,
      status: o.status,
      rejectedReason: o.rejected_reason || '',
      date: new Date(o.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      createdAt: new Date(o.created_at).getTime(),
      items: (o.order_items || []).map(i => ({
        productId: i.product_id,
        name: i.product_name,
        qty: i.quantity,
        price: i.price,
      })),
    }))
    setOrders(mapped)
    ls.set('orders', mapped)
  }, [])

  // ─── تحميل الطلبات عند تغير المستخدم ────────────────
  useEffect(() => {
    if (!user) return
    const uid = user.supabaseId || user.id
    loadOrders(uid, user.role === 'admin')
  }, [user, loadOrders])

  // ─── Real-time subscription للطلبات ──────────────────
  useEffect(() => {
    if (!user) return
    const uid = user.supabaseId || user.id
    const isAdmin = user.role === 'admin'
    const channel = subscribeToOrders(uid, isAdmin, () => {
      loadOrders(uid, isAdmin)
    })
    return () => { if (channel) supabase?.removeChannel(channel) }
  }, [user, loadOrders])

  // ─── تحميل المستخدمين (للمدير فقط) ───────────────
  useEffect(() => {
    if (!supabase || user?.role !== 'admin') return
    fetchAllProfiles().then(data => {
      if (data) {
        const mapped = data.map(p => ({ ...p, pass: '(supabase)' }))
        // ندمج المدير المحلي مع القائمة القادمة من Supabase
        setUsers([ADMIN_LOCAL, ...mapped.filter(u => u.email !== ADMIN_LOCAL.email)])
      }
    })
  }, [user])

  // Sync favorites للـ localStorage
  useEffect(() => { ls.set('favs', favorites) }, [favorites])

  // ─── Auth ──────────────────────────────────────────
  const login = async (email, pass) => {
    // أولاً: مدير محلي فوراً (بدون إنترنت)
    const localUser = users.find(u => u.email === email && u.pass === pass)
    if (localUser) {
      setUser(localUser)
      ls.set('user', localUser)
      return null
    }

    if (supabase) {
      try {
        // timeout 8 ثواني — لو Supabase بطيء أو معلق
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000)
        )
        const result = await Promise.race([
          signInUser({ email, password: pass }),
          timeout,
        ])
        if (!result.error) return null
        if (result.error === 'offline') return 'لا يوجد اتصال بالخادم'
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      } catch (e) {
        if (e.message === 'timeout') return 'انتهت مهلة الاتصال — تحقق من إعدادات Supabase أو الإنترنت'
        return 'حدث خطأ في الاتصال — حاول مجدداً'
      }
    }

    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  }

  const register = async (data) => {
    if (supabase) {
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        )
        const result = await Promise.race([
          signUpUser({
            email: data.email,
            password: data.pass,
            name: data.name,
            phone: data.phone || '',
            address: data.address || '',
          }),
          timeout,
        ])
        if (!result.error) return null
        if (result.error === 'offline') {
          // fallback offline
        } else {
          return result.error
        }
      } catch (e) {
        if (e.message === 'timeout') return 'انتهت مهلة الاتصال — تحقق من الإنترنت'
        return 'حدث خطأ في الاتصال — حاول مجدداً'
      }
    }
    // Fallback offline
    if (users.find(u => u.email === data.email)) return 'هذا البريد مسجل مسبقاً'
    const newUser = { ...data, id: Date.now().toString(), role: 'user' }
    const updated = [...users, newUser]
    setUsers(updated)
    ls.set('users', updated)
    setUser(newUser)
    ls.set('user', newUser)
    return null
  }

  const logout = async () => {
    await signOutUser()
    setUser(null)
    setCart([])
    ls.set('user', null)
  }

  const updateUser = async (updated) => {
    const uid = updated.supabaseId || updated.id
    if (supabase && updated.supabaseId) {
      await updateProfile(uid, {
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
      })
    }
    setUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    showToast('تم تحديث البيانات بنجاح ✓')
  }

  // ─── Products ──────────────────────────────────────
  const saveProducts = (p) => setProducts(p)

  const addProduct = async (prod) => {
    const sbProd = await insertProduct({
      name: prod.name,
      price: Number(prod.price),
      stock: Number(prod.stock) || 0,
      category: prod.category || 'عام',
      icon: prod.icon || '💊',
      description: prod.description || '',
      image_url: prod.image_url || null,
    })
    if (sbProd) {
      setProducts(prev => {
        const updatedArr = [sbProd, ...prev]
        ls.set('products', updatedArr)
        return updatedArr
      })
    } else {
      // offline fallback
      const newProd = { ...prod, id: Date.now().toString() }
      setProducts(prev => {
        const updatedArr = [newProd, ...prev]
        ls.set('products', updatedArr)
        return updatedArr
      })
    }
    showToast('تم إضافة المنتج ✓')
  }

  const updateProduct = async (updated) => {
    await updateProductInDB(updated.id, {
      name: updated.name,
      price: Number(updated.price),
      stock: Number(updated.stock),
      category: updated.category,
      icon: updated.icon,
      description: updated.description,
      image_url: updated.image_url || null,
    })
    setProducts(prev => {
      const arr = prev.map(p => p.id === updated.id ? updated : p)
      ls.set('products', arr)
      return arr
    })
    showToast('تم تحديث المنتج ✓')
  }

  const deleteProduct = async (id) => {
    await deleteProductFromDB(id)
    setProducts(prev => {
      const arr = prev.filter(p => p.id !== id)
      ls.set('products', arr)
      return arr
    })
    showToast('تم حذف المنتج', 'error')
  }

  // ─── Cart ──────────────────────────────────────────
  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id)
    const currentQty = existing ? existing.qty : 0
    
    if (product.stock <= currentQty) {
      return showToast('عذراً، لا يوجد مخزون كافٍ من هذا الدواء', 'error')
    }

    setCart(prev => {
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }]
    })
    showToast(`تم إضافة ${product.name} للسلة 🛒`)
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const updateCartQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id)
    
    const product = products.find(p => p.id === id)
    if (product && qty > product.stock) {
      return showToast('عذراً، الكمية المطلوبة تتجاوز المتوفر في المخزون', 'error')
    }

    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  // ─── Favorites ─────────────────────────────────────
  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  // ─── Orders ────────────────────────────────────────
  const placeOrder = async (address) => {
    // التحقق من توفر المخزون لكل الأصناف قبل إتمام الطلب
    for (const item of cart) {
      const p = products.find(prod => prod.id === item.id)
      if (!p || p.stock < item.qty) {
        return showToast(`عذراً، دواء ${item.name} لم يعد متوفراً بالكمية المطلوبة`, 'error')
      }
    }

    const uid = user.supabaseId || user.id
    const orderData = {
      userId: uid,
      userName: user.name,
      total: cartTotal,
      address,
      items: cart.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
    }

    const sbOrder = await insertOrder(orderData)

    const localOrder = {
      id: sbOrder?.id || Date.now().toString(),
      userId: uid,
      userName: user.name,
      total: cartTotal,
      address,
      items: orderData.items,
      status: 'pending',
      rejectedReason: '',
      date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      createdAt: Date.now(),
    }
    setOrders(prev => {
      const arr = [localOrder, ...prev]
      ls.set('orders', arr)
      return arr
    })
    clearCart()
    showToast('تم تأكيد طلبك بنجاح 🎉')
    return localOrder
  }

  const updateOrderStatus = async (id, status, reason = '') => {
    await updateOrderStatusInDB(id, status, reason)
    
    // إذا تمت الموافقة (status === 'shipping')، نقوم بخصم المخزون
    if (status === 'shipping') {
      const order = orders.find(o => o.id === id)
      if (order) {
        await deductStock(order.items)
        // تحديث المخزون محلياً
        setProducts(prev => {
          const arr = prev.map(p => {
            const ordered = order.items.find(i => i.productId === p.id)
            if (!ordered) return p
            return { ...p, stock: Math.max(0, p.stock - ordered.qty) }
          })
          ls.set('products', arr)
          return arr
        })
      }
    }

    setOrders(prev => {
      const arr = prev.map(o => o.id === id ? { ...o, status, rejectedReason: reason } : o)
      ls.set('orders', arr)
      return arr
    })
    showToast(status === 'rejected' ? 'تم رفض الطلب' : 'تم تحديث حالة الطلب ✓')
  }

  // ─── Admin: users ──────────────────────────────────
  const toggleUserRole = async (id) => {
    if (id === 'admin-001') { showToast('لا يمكن تعديل المدير الرئيسي', 'error'); return }
    const target = users.find(u => u.id === id)
    if (!target) return
    const newRole = target.role === 'admin' ? 'user' : 'admin'
    await updateUserRole(id, newRole)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
    showToast('تم تحديث الصلاحية ✓')
  }

  const deleteUser = (id) => {
    if (id === 'admin-001') { showToast('لا يمكن حذف المدير الرئيسي', 'error'); return }
    setUsers(prev => prev.filter(u => u.id !== id))
    showToast('تم حذف المستخدم', 'error')
  }

  // ─── شاشة تحميل ────────────────────────────────────
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #1565C0', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <StoreContext.Provider value={{
      user, products, users, orders, cart, favorites, toast, cartTotal, cartCount,
      login, register, logout, updateUser,
      saveProducts, addProduct, updateProduct, deleteProduct,
      addToCart, removeFromCart, updateCartQty, clearCart,
      toggleFavorite,
      placeOrder, updateOrderStatus,
      toggleUserRole, deleteUser,
      showToast,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
