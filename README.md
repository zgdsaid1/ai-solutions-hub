# 🤖 AI Solutions Hub

منصة شاملة لحلول الذكاء الاصطناعي توفر مجموعة متنوعة من الأدوات الذكية للشركات والمطورين.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-green.svg)](https://github.com/your-repo/ai-solutions-hub)
[![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)](https://github.com/your-repo/ai-solutions-hub/releases)

## 📁 هيكل المشروع

```
ai-solutions-hub/
├── 📱 apps/                          # التطبيقات الأمامية
│   ├── nextjs-full-stack/           # تطبيق Next.js كامل المواصفات
│   ├── react-vite-auth/             # تطبيق React مع نظام المصادقة
│   └── react-vite-simple/           # تطبيق React بسيط
│
├── ⚙️  backend/                       # الخدمات الخلفية
│   ├── server/                      # خادم Express.js
│   └── supabase/                    # دوال Supabase Edge
│
├── ⚡ supabase/                      # إعدادات قاعدة البيانات
│   ├── migrations/                  # ملفات الهجرة
│   ├── functions/                   # دوال إضافية
│   └── tables/                      # مخططات الجداول
│
├── 📚 documentation/                 # التوثيق والأدلة
│   ├── deployment/                  # أدلة النشر
│   ├── guides/                      # أدلة الاستخدام
│   └── reports/                     # التقارير والملخصات
│
├── 📊 docs/                          # البحوث والتوثيق التقني
│   ├── ai_routing_systems/          # أنظمة توجيه الذكاء الاصطناعي
│   ├── enterprise_ai/               # حلول الذكاء الاصطناعي للشركات
│   └── multimodal_ai/               # الذكاء الاصطناعي متعدد الوسائط
│
├── 🛠️  scripts/                      # سكريبتات الأتمتة
├── ⚙️  config/                       # ملفات التكوين
├── 📦 archives/                      # الملفات المضغوطة
├── 💭 memories/                      # حالة المشروع والذكريات
└── 📸 .browser_screenshots/         # لقطات شاشة للتطوير
```

## 🚀 التطبيقات المتاحة

### 1. Next.js Full Stack (`apps/nextjs-full-stack/`)
- **التقنيات**: Next.js 14, React, TypeScript, Tailwind CSS
- **المميزات**: 
  - نظام مصادقة كامل مع Supabase
  - واجهة مستخدم حديثة ومتجاوبة
  - دعم Server-Side Rendering
  - تكامل مع دوال Edge
- **الاستخدام**: للإنتاج والمشاريع الكبيرة

### 2. React + Vite Auth (`apps/react-vite-auth/`)
- **التقنيات**: React, TypeScript, Vite, Tailwind CSS
- **المميزات**:
  - نظام مصادقة متقدم
  - واجهة سريعة مع Vite
  - صفحات متعددة (Dashboard, Profile, Subscription)
- **الاستخدام**: للتطوير السريع مع المصادقة

### 3. React + Vite Simple (`apps/react-vite-simple/`)
- **التقنيات**: React, TypeScript, Vite
- **المميزات**:
  - تطبيق بسيط وخفيف
  - صفحة رئيسية ولوحة تحكم
- **الاستخدام**: للنماذج الأولية والتجارب

## 🛠️ الخدمات الذكية المتاحة

- 📝 **AI Content Creator** - إنشاء المحتوى بالذكاء الاصطناعي
- 🤝 **AI Customer Support** - دعم العملاء الذكي
- 📊 **AI Data Analyzer** - تحليل البيانات المتقدم
- 📄 **AI Document Automation** - أتمتة المستندات
- ✉️ **AI Email Assistant** - مساعد البريد الإلكتروني
- ⚖️ **AI Legal Advisor** - استشارات قانونية ذكية
- 📈 **AI Marketing Strategist** - استراتيجيات التسويق
- 💼 **AI Sales Assistant** - مساعد المبيعات

## 🚀 البدء السريع

### 1. تشغيل تطبيق Next.js (موصى به)

```bash
cd apps/nextjs-full-stack
npm install
npm run dev
```

### 2. تشغيل تطبيق React مع المصادقة

```bash
cd apps/react-vite-auth
npm install
npm run dev
```

### 3. تشغيل Backend

```bash
cd backend/server
npm install
npm start
```

## 🔧 الإعداد والتكوين

### متطلبات النظام
- Node.js 18+
- npm أو pnpm
- حساب Supabase
- متغيرات البيئة (انظر `.env.example` في كل تطبيق)

### إعداد قاعدة البيانات
```bash
# تشغيل هجرة قاعدة البيانات
cd supabase
npx supabase db push

# إنشاء مستخدم إداري
npx supabase functions deploy create-admin-user
```

### متغيرات البيئة المطلوبة

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Stripe (اختياري)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 📚 التوثيق

- [📁 دليل النشر](documentation/deployment/) - خطوات النشر المفصلة
- [📖 أدلة الاستخدام](documentation/guides/) - شروحات الاستخدام
- [📊 التقارير](documentation/reports/) - تقارير المشروع والتقدم
- [🔬 البحوث التقنية](docs/) - الأبحاث والتوثيق المتقدم

## 🛠️ أدوات التطوير

### السكريبتات المتاحة
- `scripts/setup-stripe.sh` - إعداد Stripe للدفع
- `scripts/test-api.sh` - اختبار APIs
- `scripts/fix-vercel-white-page.sh` - إصلاح مشاكل Vercel

### ملفات التكوين
- `config/stripe-config.json` - إعدادات Stripe
- `config/vercel.json` - إعدادات النشر
- `config/.env.*` - متغيرات البيئة

## 🚀 النشر

### خيارات النشر المتاحة

#### 1. Vercel (موصى به للـ Frontend)
```bash
# للتطبيق Next.js
cd apps/nextjs-full-stack
vercel deploy

# أو باستخدام السكريبت
./scripts/deploy-vercel.sh
```

#### 2. Railway (للـ Backend)
```bash
# نشر الخادم
cd backend/server
railway deploy

# أو باستخدام السكريبت
./scripts/deploy-railway.sh
```

#### 3. Supabase (للدوال)
```bash
cd backend/supabase
supabase functions deploy
```

انظر [دليل النشر الكامل](documentation/deployment/) لمزيد من التفاصيل.

## 🏗️ التطوير

### إعداد بيئة التطوير

```bash
# استنساخ المستودع
git clone https://github.com/your-username/ai-solutions-hub.git
cd ai-solutions-hub

# تثبيت التبعيات لجميع التطبيقات
npm run install:all

# تشغيل جميع التطبيقات
npm run dev:all
```

### أوامر مفيدة

```bash
# تشغيل اختبارات API
npm run test:api

# بناء جميع التطبيقات
npm run build:all

# تنظيف الملفات المؤقتة
npm run clean

# فحص الكود
npm run lint:all
```

## 🎨 نظام التصميم

### الألوان الأساسية
- **Primary**: Blue (#0ea5e9)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### الخطوط
- **Primary**: Inter (sans-serif)
- **Monospace**: JetBrains Mono

## 🔒 الأمان

- Row Level Security (RLS) لجميع الجداول
- مصادقة JWT
- حماية API Keys
- إدارة الأدوار والصلاحيات
- تشفير البيانات الحساسة

## 📊 الأداء

- **حجم البناء**: ~263KB (مضغوط: 63KB)
- **التحميل الأول**: < 2 ثانية
- **نقاط Lighthouse**: 95+
- **متوافق مع الجوال**: نعم
- **جاهز للـ SEO**: نعم

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

### قواعد المساهمة
- اتبع معايير الكود المحددة
- أضف اختبارات للميزات الجديدة
- حدث التوثيق إذا لزم الأمر
- تأكد من نجاح جميع الاختبارات

## 🐛 الإبلاغ عن مشاكل

إذا واجهت مشكلة، يرجى فتح [issue جديد](https://github.com/your-username/ai-solutions-hub/issues) مع التفاصيل التالية:

- وصف المشكلة
- خطوات إعادة الإنتاج
- نوع المتصفح ونظام التشغيل
- لقطات شاشة (إن أمكن)

## 📄 الرخصة

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🙏 شكر وتقدير

- [React](https://reactjs.org/) - مكتبة UI
- [Next.js](https://nextjs.org/) - إطار عمل React
- [Supabase](https://supabase.com/) - قاعدة البيانات والمصادقة
- [Tailwind CSS](https://tailwindcss.com/) - إطار عمل CSS
- [OpenAI](https://openai.com/) - خدمات الذكاء الاصطناعي

## 📞 التواصل

للدعم والاستفسارات:

- 📧 البريد الإلكتروني: support@ai-solutions-hub.com
- 🐛 GitHub Issues: [فتح issue جديد](https://github.com/your-username/ai-solutions-hub/issues)
- 💬 Discord: [انضم لخادمنا](https://discord.gg/your-server)

---

<div align="center">

**تم إنشاؤه بواسطة فريق AI Solutions Hub** 🚀

[![GitHub](https://img.shields.io/github/license/your-username/ai-solutions-hub)](LICENSE)
[![Stars](https://img.shields.io/github/stars/your-username/ai-solutions-hub)](https://github.com/your-username/ai-solutions-hub/stargazers)
[![Forks](https://img.shields.io/github/forks/your-username/ai-solutions-hub)](https://github.com/your-username/ai-solutions-hub/network)

</div>