# AI Solutions Hub v1.7 - Quick Deployment Reference

## 🚀 Frontend Status
✅ **DEPLOYED AND LIVE**: https://j1oc3f076g3f.space.minimax.io

## 📝 Backend Deployment (30 minutes)

### Prerequisites
- Supabase account with project: `zkmdfyfhekmbtumkxgsw`
- Stripe account with API keys
- OpenAI API key
- Google AI API key

### 3-Step Quick Deploy

#### 1️⃣ Deploy Database (5 min)
```
1. Open: https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/sql
2. Copy: /workspace/ai-solutions-backend/deploy-database.sql
3. Paste and Run in SQL Editor
4. Verify: 6 tables created
```

#### 2️⃣ Deploy Edge Functions (10 min)
```bash
npm install -g supabase
supabase login
cd /workspace/ai-solutions-backend
supabase link --project-ref zkmdfyfhekmbtumkxgsw
supabase functions deploy
```

#### 3️⃣ Configure Secrets (5 min)
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GOOGLE_AI_API_KEY=AIza...
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Get service role key from:
https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/settings/api

### Additional Setup

**Enable Auth** (2 min):
https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/auth/providers

**Stripe Webhook** (3 min):
- URL: `https://zkmdfyfhekmbtumkxgsw.supabase.co/functions/v1/stripe-webhook`
- Events: `customer.subscription.*`, `invoice.payment_*`

**Stripe Products** (5 min):
- Starter: $9/month
- Pro: $29/month
- Business: $99/month
- Enterprise: $299/month

## 📄 Documentation Files

- `/workspace/BACKEND_DEPLOYMENT_GUIDE.md` - Complete guide
- `/workspace/DEPLOYMENT_SUMMARY.md` - Full status report
- `/workspace/ai-solutions-backend/deploy-database.sql` - Database schema
- `/workspace/README.md` - Project documentation

## ✅ Deployment Checklist

- [ ] Database schema deployed
- [ ] Edge functions deployed (10 functions)
- [ ] Secrets configured
- [ ] Email auth enabled
- [ ] Stripe webhook configured
- [ ] Stripe products created
- [ ] Test authentication
- [ ] Test AI tools
- [ ] Test subscription flow

## 🔗 Important Links

- **Frontend**: https://j1oc3f076g3f.space.minimax.io
- **Supabase Dashboard**: https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw
- **SQL Editor**: https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/sql
- **Auth Settings**: https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/auth/providers
- **API Settings**: https://supabase.com/dashboard/project/zkmdfyfhekmbtumkxgsw/settings/api

## 🧪 Test Commands

**Test Database:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Test Edge Function:**
```bash
curl -X POST https://zkmdfyfhekmbtumkxgsw.supabase.co/functions/v1/ai-router \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test", "requestType": "simple"}'
```

## 📊 Project Statistics

- **Frontend Files**: 247 lines dashboard, 231 lines landing page
- **Edge Functions**: 11 functions (AI router + 8 tools + 2 payment)
- **Database Tables**: 6 tables with RLS policies
- **Total Code**: ~2000+ lines production-ready code
- **Design System**: 1481 lines comprehensive design spec
- **Documentation**: 950+ lines of deployment guides

## 💡 Quick Tips

1. **Database First**: Deploy database before edge functions
2. **Secrets**: Keep service role key secure
3. **Testing**: Test each component after deployment
4. **Monitoring**: Check Supabase logs for errors
5. **Stripe**: Use test mode first, then switch to live

## 🆘 Troubleshooting

**Functions won't deploy?**
- Check: `supabase login` status
- Verify: Project linked correctly
- Review: Function logs for errors

**Database connection fails?**
- Verify: RLS policies allow access
- Check: ANON_KEY is correct
- Test: Direct SQL query first

**Authentication not working?**
- Enable: Email provider in Auth settings
- Check: Frontend has correct Supabase URL
- Test: Direct signup via Supabase dashboard

## 📞 Need Help?

Refer to comprehensive guides:
- `/workspace/BACKEND_DEPLOYMENT_GUIDE.md`
- `/workspace/DEPLOYMENT_SUMMARY.md`
- Official Supabase docs: https://supabase.com/docs
