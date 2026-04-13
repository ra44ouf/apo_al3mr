# 🏥 صيدلية أبو العمر
موقع صيدلية احترافي متكامل مبني بـ React + Tailwind + Framer Motion

---

## 🚀 تشغيل المشروع

```bash
# 1. تثبيت المكتبات
npm install

# 2. تشغيل المشروع محلياً
npm run dev

# 3. بناء للإنتاج
npm run build
```

---

## 🔑 بيانات الدخول الافتراضية

| النوع | البريد | كلمة المرور |
|-------|--------|-------------|
| مدير (Admin) | admin@pharmacy.com | admin123 |

---

## 📁 هيكل المشروع

```
src/
├── components/
│   ├── Landing.jsx       ← أنيميشن الدخول
│   ├── Navbar.jsx        ← شريط التنقل
│   ├── ProductCard.jsx   ← كارت المنتج
│   └── Toast.jsx         ← الإشعارات
├── hooks/
│   └── useStore.jsx      ← إدارة الحالة العامة
├── lib/
│   └── supabase.js       ← إعداد Supabase + SQL Schema
├── pages/
│   ├── AuthPage.jsx      ← تسجيل دخول / حساب جديد
│   ├── HomePage.jsx      ← الرئيسية
│   ├── ProductsPage.jsx  ← كل المنتجات
│   ├── CartPage.jsx      ← السلة + الدفع
│   ├── ProfilePage.jsx   ← الملف الشخصي
│   ├── AdminPage.jsx     ← لوحة التحكم (Wrapper)
│   └── admin/
│       ├── AdminOverview.jsx   ← إحصائيات
│       ├── AdminProducts.jsx   ← إدارة المنتجات
│       ├── AdminDrugAPI.jsx    ← بحث FDA
│       ├── AdminUsers.jsx      ← إدارة المستخدمين
│       └── AdminOrders.jsx     ← إدارة الطلبات
└── App.jsx               ← التوجيه الرئيسي
```

---

## ⚙️ التقنيات المستخدمة

| التقنية | الغرض |
|---------|-------|
| React 18 | واجهة المستخدم |
| React Router v6 | التوجيه |
| Framer Motion | الأنيميشن |
| Tailwind CSS | التصميم |
| Supabase | قاعدة البيانات (اختياري) |
| OpenFDA API | بحث الأدوية |
| localStorage | تخزين البيانات محلياً |

---

## 🗄️ ربط Supabase (اختياري)

1. أنشئ مشروعاً على [supabase.com](https://supabase.com)
2. انسخ `.env.example` إلى `.env`
3. أضف مفاتيح المشروع
4. نفّذ SQL Schema من ملف `src/lib/supabase.js`

> **ملاحظة:** الموقع يعمل بالكامل بدون Supabase باستخدام localStorage

---

## 🌐 نشر الموقع

```bash
# Vercel
npm i -g vercel
vercel

# Netlify
npm run build
# ارفع مجلد dist/
```

---

## ✨ المميزات

- 🎬 **أنيميشن** Landing مع رسم علامة (+)
- 👤 **نظام مستخدمين** كامل (تسجيل / دخول / ملف شخصي)
- 🔐 **صلاحيات** (user / admin)
- 🛍️ **متجر** مع بحث وفلترة وسلة
- ❤️ **مفضلة** للمنتجات
- 📦 **تتبع الطلبات** بحالات متعددة
- ⚙️ **لوحة تحكم** احترافية (5 أقسام)
- 🔎 **ربط FDA API** للبحث عن الأدوية وإضافتها
- 📱 **متجاوب** مع الجوال بالكامل
- 💾 **حفظ تلقائي** في localStorage
