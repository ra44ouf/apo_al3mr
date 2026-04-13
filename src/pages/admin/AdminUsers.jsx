// src/pages/admin/AdminUsers.jsx
import { useState } from 'react'
import { useStore } from '../../hooks/useStore'

export default function AdminUsers() {
  const { users, toggleUserRole, deleteUser } = useStore()
  const [search, setSearch] = useState('')

  const filtered = users.filter(u =>
    !search || u.name?.includes(search) || u.email?.includes(search)
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h3 className="font-black text-blue-900 text-sm">👥 المستخدمون ({users.length})</h3>
        <input className="inp !py-1.5 !text-xs" style={{ maxWidth: 240 }}
          placeholder="بحث بالاسم أو البريد..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#EFF6FF' }}>
              {['الاسم', 'البريد الإلكتروني', 'الهاتف', 'العنوان', 'الصلاحية', 'إجراءات'].map(h => (
                <th key={h} className="text-right px-3 py-2.5 text-xs font-black text-blue-800 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}
                className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-blue-700"
                      style={{ background: '#EFF6FF' }}>
                      {u.name?.charAt(0) || '?'}
                    </div>
                    <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{u.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-slate-500 text-xs">{u.email}</td>
                <td className="px-3 py-2.5 text-slate-500 text-xs">{u.phone || '—'}</td>
                <td className="px-3 py-2.5 text-slate-500 text-xs max-w-32 overflow-hidden"
                  style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.address || '—'}
                </td>
                <td className="px-3 py-2.5">
                  <span className="badge"
                    style={{
                      background: u.role === 'admin' ? '#EFF6FF' : '#D1FAE5',
                      color: u.role === 'admin' ? '#1565C0' : '#065F46',
                    }}>
                    {u.role === 'admin' ? '👑 مدير' : 'مستخدم'}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-2">
                    <button onClick={() => toggleUserRole(u.id)}
                      className="btn-secondary !py-1 !px-2.5 !text-xs">
                      {u.role === 'admin' ? '⬇ تخفيض' : '⬆ ترقية'}
                    </button>
                    {u.id !== 'admin-001' && (
                      <button onClick={() => deleteUser(u.id)} className="btn-red">حذف</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-8">لا توجد نتائج</p>
        )}
      </div>
    </div>
  )
}
