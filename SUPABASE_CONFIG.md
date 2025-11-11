# 🔧 Supabase Configuration Guide

## Database Account Setup - Complete These Steps

### 1. Email Templates Configuration (CRITICAL for Password Reset)

**Go to your Supabase Dashboard:**
1. Open [supabase.com](https://supabase.com) and login
2. Select your AI Solutions Hub project
3. Go to **Authentication** → **Email Templates**

**Configure Reset Password Template:**
1. Click on **Reset Password** template
2. Find the **Redirect to** field
3. Set the redirect URL to: `{{ .SiteURL }}/reset-password`
4. Click **Save**

**Configure Signup Template (Optional but recommended):**
1. Click on **Confirm Signup** template
2. Set **Redirect to**: `{{ .SiteURL }}/login`
3. Click **Save**

### 2. Authentication Settings

**Go to Authentication → Settings:**

**Site URL:**
- Set to: `https://ai-solutions-hub-7tf2.vercel.app`
- This tells Supabase where to redirect users after authentication

**Additional Redirect URLs (for development):**
- Add: `http://localhost:3000` (for local testing)
- Add: `https://ai-solutions-hub-7tf2.vercel.app/reset-password`

### 3. Email Provider Settings (If using custom domain)

If you want to use your own domain for emails:
1. Go to **Authentication** → **Settings** → **Email Provider**
2. Configure your SMTP settings or use Supabase's default email service

### 4. Database Tables (Already Created)

The following tables were automatically created by Supabase Auth:
- `auth.users` - Stores user account information
- `auth.sessions` - Stores active user sessions

### 5. Authentication Flow Testing

After configuration, test these flows:

**✅ Signup Flow:**
1. Go to `/signup`
2. Enter email and password
3. Check email for verification link
4. Click verification link
5. Should redirect to login page

**✅ Login Flow:**
1. Go to `/login`
2. Enter verified email and password
3. Should redirect to `/dashboard`

**✅ Password Reset Flow:**
1. Go to `/login` → "Forgot Password?"
2. Enter your email
3. Check email for reset link
4. Click reset link
5. Should redirect to `/reset-password`
6. Enter new password
7. Should redirect to `/dashboard`

### 6. User Roles and Policies (Optional)

If you plan to add user-specific data later:
1. Go to **Authentication** → **Policies**
2. Configure Row Level Security (RLS) policies for your data tables

## 🚨 Common Issues & Solutions

**Problem:** Password reset emails not arriving
**Solution:** 
- Check spam/junk folder
- Verify **Reset Password** email template redirect URL
- Ensure Site URL is set correctly

**Problem:** Users can't verify email
**Solution:**
- Check **Confirm Signup** email template
- Verify redirect URL points to `/login`
- Check user email spam folder

**Problem:** Auth state not persisting
**Solution:**
- Verify cookies are enabled in browser
- Check if there are browser security restrictions
- Ensure middleware is working properly

## ✅ Checklist

- [ ] Email templates configured with correct redirect URLs
- [ ] Site URL set to production URL
- [ ] Additional redirect URLs added
- [ ] Authentication providers configured (if using social auth in future)
- [ ] Email delivery tested
- [ ] All auth flows tested

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard for error logs
2. Verify all redirect URLs are correct
3. Test authentication flows step by step
4. Check browser console for JavaScript errors

---

**Your system is ready!** The authentication system is fully functional once these Supabase configurations are completed.