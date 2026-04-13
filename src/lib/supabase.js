// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials missing. Running in offline mode (localStorage).')
}

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// ─── Helpers ───────────────────────────────────────────────────
export const isOnline = () => !!supabase

// ─── Products ──────────────────────────────────────────────────
export async function fetchProducts() {
  if (!supabase) return null
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchProducts:', error.message); return null }
  return data
}

export async function insertProduct(prod) {
  if (!supabase) return null
  const { data, error } = await supabase.from('products').insert([prod]).select().single()
  if (error) { console.error('insertProduct:', error.message); return null }
  return data
}

export async function updateProductInDB(id, changes) {
  if (!supabase) return false
  const { error } = await supabase.from('products').update(changes).eq('id', id)
  if (error) { console.error('updateProduct:', error.message); return false }
  return true
}

export async function deleteProductFromDB(id) {
  if (!supabase) return false
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) { console.error('deleteProduct:', error.message); return false }
  return true
}

// خصم المخزون عند الطلب
export async function deductStock(items) {
  if (!supabase) return
  for (const item of items) {
    // نقرأ المخزون الحالي ثم نخصم
    const { data: prod } = await supabase
      .from('products').select('stock').eq('id', item.productId).single()
    if (!prod) continue
    const newStock = Math.max(0, prod.stock - item.qty)
    await supabase.from('products').update({ stock: newStock }).eq('id', item.productId)
  }
}

// Real-time subscription للطلبات
export function subscribeToOrders(userId, isAdmin, callback) {
  if (!supabase) return null
  const channel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        ...(isAdmin ? {} : { filter: `user_id=eq.${userId}` }),
      },
      () => callback()
    )
    .subscribe()
  return channel
}

// ─── Auth (Supabase Auth) ───────────────────────────────────────
export async function signUpUser({ email, password, name, phone, address }) {
  if (!supabase) return { user: null, error: 'offline' }
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { user: null, error: error.message }
  // insert profile
  await supabase.from('profiles').insert([{
    id: data.user.id,
    email,
    name,
    phone: phone || '',
    address: address || '',
    role: 'user',
  }])
  return { user: data.user, error: null }
}

export async function signInUser({ email, password }) {
  if (!supabase) return { user: null, error: 'offline' }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: error.message }
  return { user: data.user, error: null }
}

export async function signOutUser() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function fetchProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  return data
}

export async function updateProfile(userId, changes) {
  if (!supabase) return false
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId)
  if (error) { console.error('updateProfile:', error.message); return false }
  return true
}

// ─── Orders ────────────────────────────────────────────────────
export async function insertOrder({ userId, userName, total, address, items }) {
  if (!supabase) return null

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([{ user_id: userId, user_name: userName, total_price: total, address, status: 'pending' }])
    .select()
    .single()

  if (orderErr) { console.error('insertOrder:', orderErr.message); return null }

  const orderItems = items.map(i => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.name,
    quantity: i.qty,
    price: i.price,
  }))
  await supabase.from('order_items').insert(orderItems)

  return order
}

export async function fetchOrders(userId, isAdmin) {
  if (!supabase) return null
  let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
  if (!isAdmin) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) { console.error('fetchOrders:', error.message); return null }
  return data
}

export async function updateOrderStatusInDB(id, status, reason = '') {
  if (!supabase) return false
  const changes = { status }
  if (reason) changes.rejected_reason = reason
  const { error } = await supabase.from('orders').update(changes).eq('id', id)
  if (error) { console.error('updateOrderStatus:', error.message); return false }
  return true
}

// ─── Users (profiles) for admin ────────────────────────────────
export async function fetchAllProfiles() {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) { console.error('fetchAllProfiles:', error.message); return null }
  return data
}

export async function updateUserRole(userId, role) {
  if (!supabase) return false
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) { console.error('updateUserRole:', error.message); return false }
  return true
}
