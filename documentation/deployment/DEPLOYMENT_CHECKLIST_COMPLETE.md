# AI Solutions Hub - Deployment Checklist

Use this checklist to ensure all steps are completed for successful deployment.

## ✅ Pre-Deployment Checklist

### Accounts & Access
- [ ] Stripe account created (https://stripe.com)
- [ ] Railway account created (https://railway.app)
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub account (optional but recommended)
- [ ] Supabase project access confirmed
- [ ] Domain registrar access (for aisolutionshub.co)

### Tools Installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Stripe CLI installed (optional but recommended)
- [ ] Railway CLI installed (optional)
- [ ] Vercel CLI installed (optional)

---

## 🎯 Part 1: Stripe Setup

### Product Creation
- [ ] Stripe CLI logged in
- [ ] Run `./setup-stripe.sh` script
- [ ] Copy Starter Price ID
- [ ] Copy Pro Price ID
- [ ] Copy Business Price ID
- [ ] Copy Enterprise Price ID
- [ ] Update `stripe-config.json` with Price IDs

### Webhook Configuration
- [ ] Create webhook endpoint in Stripe Dashboard
- [ ] Add webhook URL (will be Railway URL)
- [ ] Select subscription events
- [ ] Select payment events
- [ ] Copy webhook secret
- [ ] Save webhook secret for Railway deployment

---

## 🚂 Part 2: Railway Backend Deployment

### Project Setup
- [ ] Login to Railway
- [ ] Create new project
- [ ] Connect GitHub repo (or deploy local)
- [ ] Select `ai-solutions-backend/server` directory

### Environment Variables
- [ ] SUPABASE_URL set
- [ ] SUPABASE_SERVICE_ROLE_KEY set
- [ ] STRIPE_SECRET_KEY set
- [ ] STRIPE_WEBHOOK_SECRET set
- [ ] OPENAI_API_KEY set
- [ ] GEMINI_API_KEY set
- [ ] DEEPSEEK_API_KEY set
- [ ] FRONTEND_URL set (temporary)
- [ ] JWT_SECRET set
- [ ] NODE_ENV set to "production"
- [ ] PORT set to 8080

### Deployment & Testing
- [ ] Railway deployment successful
- [ ] Generate Railway domain
- [ ] Copy Railway URL
- [ ] Test health endpoint: `https://your-app.railway.app/api/health`
- [ ] Update Stripe webhook URL with Railway URL
- [ ] Test Stripe webhook delivery

---

## ▲ Part 3: Vercel Frontend Deployment

### Project Setup
- [ ] Login to Vercel
- [ ] Create new project
- [ ] Import from GitHub (or upload folder)
- [ ] Select Next.js framework
- [ ] Configure build settings

### Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL set
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set
- [ ] NEXT_PUBLIC_APP_URL set
- [ ] NEXT_PUBLIC_BACKEND_URL set (Railway URL)

### Domain Configuration
- [ ] Vercel deployment successful
- [ ] Add custom domain: aisolutionshub.co
- [ ] Configure DNS settings
- [ ] Verify DNS propagation
- [ ] SSL certificate provisioned
- [ ] Test custom domain access

---

## 🔄 Part 4: Final Configuration

### Backend Updates
- [ ] Update Railway FRONTEND_URL to Vercel URL
- [ ] Redeploy Railway backend
- [ ] Test CORS configuration

### Database Setup (if not done)
- [ ] Run deploy-database.sql in Supabase
- [ ] Verify all 6 tables created
- [ ] Check RLS policies applied
- [ ] Test database connections

### Stripe Final Steps
- [ ] Verify webhook is receiving events
- [ ] Test creating a subscription
- [ ] Confirm database updates on subscription
- [ ] Check Stripe Dashboard for subscription

---

## 🧪 Part 5: Testing

### Frontend Testing
- [ ] Homepage loads correctly
- [ ] Sign up works
- [ ] Login works
- [ ] Pricing page displays all plans
- [ ] All navigation links work
- [ ] Responsive design on mobile
- [ ] No console errors

### Stripe Flow Testing
- [ ] Click "Subscribe" on a plan
- [ ] Stripe checkout loads
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Payment succeeds
- [ ] Redirected to success page
- [ ] Subscription appears in Stripe Dashboard
- [ ] Subscription saved to database

### Dashboard Testing
- [ ] Dashboard accessible after payment
- [ ] User profile displays
- [ ] Subscription status shows
- [ ] All 8 AI tools visible
- [ ] Can access tools based on plan

### AI Tools Testing
- [ ] Marketing tool works
- [ ] Legal tool works
- [ ] Inventory tool works
- [ ] Voice/SMS tool works
- [ ] Email tool works
- [ ] Data tool works
- [ ] Logistics tool works
- [ ] Documents tool works

### Backend Testing
- [ ] Health check endpoint responds
- [ ] Authentication endpoints work
- [ ] Stripe webhook receives events
- [ ] Logs show no errors
- [ ] Rate limiting works

---

## 📊 Part 6: Monitoring & Analytics

### Setup Monitoring
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure alert notifications
- [ ] Test alert delivery

### Analytics
- [ ] Google Analytics installed (optional)
- [ ] Track key events
- [ ] Monitor conversion funnel
- [ ] Set up goal tracking

---

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All tests passed
- [ ] No critical errors in logs
- [ ] SSL certificate active
- [ ] Custom domain working
- [ ] Stripe live mode enabled
- [ ] Backup plan in place

### Go-Live
- [ ] Announce launch
- [ ] Monitor for first 24 hours
- [ ] Check for errors
- [ ] Monitor subscription creation
- [ ] Respond to user feedback

### Post-Launch
- [ ] Set up regular backups
- [ ] Create monitoring dashboard
- [ ] Document any issues found
- [ ] Plan feature updates

---

## 🔒 Security Checklist

- [ ] All API keys secured
- [ ] Environment variables not committed to git
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] JWT tokens expire appropriately

---

## 📝 Documentation Checklist

- [ ] README.md updated
- [ ] API documentation complete
- [ ] User guide created
- [ ] Admin guide created
- [ ] Troubleshooting guide available
- [ ] Environment variables documented

---

## 🎯 Success Criteria

Your deployment is successful when all of these are true:

✅ **Frontend:**
- [ ] Site loads at https://aisolutionshub.co
- [ ] No errors in browser console
- [ ] All pages accessible
- [ ] Mobile responsive

✅ **Backend:**
- [ ] API health check returns 200
- [ ] All endpoints respond
- [ ] Logs show no errors
- [ ] Database connected

✅ **Stripe:**
- [ ] Checkout works
- [ ] Webhooks received
- [ ] Subscriptions created
- [ ] Payments processed

✅ **Complete Flow:**
- [ ] User can sign up
- [ ] User can subscribe
- [ ] User can access dashboard
- [ ] AI tools functional

---

## 📞 Support Contacts

If you get stuck:

1. Check deployment guides in repository
2. Review logs in Railway and Vercel dashboards
3. Check Stripe webhook event logs
4. Verify all environment variables
5. Consult COMPLETE_SETUP_GUIDE.md

---

## 📈 Next Steps After Launch

- [ ] Monitor user signups
- [ ] Track subscription conversions
- [ ] Gather user feedback
- [ ] Plan feature roadmap
- [ ] Optimize performance
- [ ] Scale infrastructure as needed

---

**Checklist Version:** 1.0  
**Last Updated:** November 10, 2025  
**Platform:** AI Solutions Hub v1.8

---

**Pro Tip:** Print this checklist and check off items as you complete them!
