# 📱 PWA to APK Deployment Checklist

## Pre-Deployment Setup

### ✅ Step 1: Generate App Icons
**Status:** ⬜ Not Started

Choose one method:

**Option A - Automated (Recommended):**
```bash
npx @pwa/asset-generator public/mavoid-logo.png public --icon-only --background "#FFFFFF"
```

**Option B - Online Tool:**
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload `public/mavoid-logo.png`
3. Download and extract icons to `/public/`

**Option C - Manual:**
See [ICON_GENERATION.md](ICON_GENERATION.md) for detailed instructions

**Verify icons created:**
```bash
# Run this to check:
.\check-pwa.ps1
```

---

### ✅ Step 2: Test Locally
**Status:** ⬜ Not Started

```bash
# Build the production version
npm run build

# Start production server
npm start
```

**Open:** http://localhost:3000

**Test in Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" - should show your app details
4. Check "Service Workers" - should show "activated and running"
5. Try going offline (Network tab → Offline) and refresh

**Run Lighthouse Audit:**
1. DevTools → Lighthouse tab
2. Select "Progressive Web App"
3. Click "Analyze page load"
4. **Target score: 90+**

---

### ✅ Step 3: Configure Environment Variables
**Status:** ⬜ Not Started

Create `.env.production` file:
```env
# Database
DATABASE_URL="your-production-database-url"

# App URL (for PWA Builder)
NEXT_PUBLIC_APP_URL="https://your-app-domain.com"
```

---

### ✅ Step 4: Deploy to Production
**Status:** ⬜ Not Started

Choose a deployment platform (must support HTTPS):

**Option A - Vercel (Recommended for Next.js):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

**Option B - Netlify:**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Deploy

**Option C - Docker (use existing setup):**
1. Build Docker image
2. Deploy to your server
3. Ensure HTTPS is configured (use nginx with Let's Encrypt)

**Your Production URL:** ___________________________

---

## APK Generation

### ✅ Step 5: Verify PWA Requirements
**Status:** ⬜ Not Started

Visit your production URL and check:
- [ ] Site loads over HTTPS ✅
- [ ] Manifest is accessible: `https://your-app.com/manifest.json`
- [ ] Service worker is registered (check DevTools)
- [ ] All icons load properly (no 404 errors)
- [ ] App is installable (install prompt appears)

---

### ✅ Step 6: Generate APK with PWA Builder
**Status:** ⬜ Not Started

1. **Go to:** https://www.pwabuilder.com/

2. **Enter your production URL:**
   ```
   https://your-app-domain.com
   ```

3. **Click "Start"**
   - PWA Builder will analyze your site
   - Should detect manifest automatically
   - Check for any warnings

4. **Review Manifest Settings:**
   - App name: MaVoid CRM ✅
   - Short name: MaVoid CRM ✅
   - Description: (check it's correct) ✅
   - Icons: (should show all 8+ icons) ✅

5. **Click "Package for Stores"**

6. **Select "Android"**
   - Choose "Trusted Web Activity (TWA)" for Play Store
   - Or choose "WebView" for side-loading only

7. **Configure Android Settings:**
   - Package ID: `com.mavoid.crm` (or your preference)
   - App version: `1.0.0`
   - Version code: `1`
   - Host: your production URL
   - Start URL: `/`

8. **Download APK**
   - Click "Download"
   - Save the generated APK file

**APK File Location:** ___________________________

---

### ✅ Step 7: Test APK on Android Device
**Status:** ⬜ Not Started

**Enable Developer Options on Android:**
1. Settings → About Phone → Tap "Build Number" 7 times
2. Go back → Developer Options → Enable "USB Debugging"

**Install APK:**

**Option A - Via USB (ADB):**
```bash
# Install Android Platform Tools if needed
# https://developer.android.com/studio/releases/platform-tools

# Connect phone via USB
# Enable file transfer on phone

# Install APK
adb install path/to/mavoid-crm.apk
```

**Option B - Direct Transfer:**
1. Copy APK to phone (via USB or cloud)
2. Open file on phone
3. Allow "Install from Unknown Sources" if prompted
4. Install

**Test the app:**
- [ ] App opens successfully ✅
- [ ] All features work (clients, tasks, payments) ✅
- [ ] Navigation works ✅
- [ ] Can add/edit/delete data ✅
- [ ] Offline mode works (turn off WiFi/data) ✅
- [ ] App icon appears in launcher ✅
- [ ] Splash screen shows (if configured) ✅

---

## Optional: Google Play Store Deployment

### ✅ Step 8: Prepare for Play Store (Optional)
**Status:** ⬜ Not Started

**Requirements:**
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Privacy Policy URL
- [ ] App screenshots (mobile + tablet)
- [ ] Feature graphic (1024x500px)
- [ ] App description

**Create Play Store Listing Assets:**

1. **Screenshots** (create in `/public/screenshots/`):
   - At least 2 phone screenshots
   - Optional: tablet screenshots
   - Recommended: 4-8 screenshots

2. **Feature Graphic:**
   - Size: 1024x500px
   - Should include app name and logo
   - No extra text needed

3. **Privacy Policy:**
   Create `PRIVACY_POLICY.md` and host it publicly

4. **App Description:**
   ```
   MaVoid CRM - Professional Client Management

   Manage your clients, tasks, payments, and business analytics 
   all in one powerful mobile app.

   Features:
   • Client Management - Track all client information
   • Kanban Board - Visual workflow management
   • Task Management - Never miss a deadline
   • Payment Tracking - Monitor payments and revenue
   • Analytics Dashboard - Detailed business insights
   • Offline Support - Work anywhere, anytime
   • Bilingual - English and Arabic support

   Perfect for freelancers, agencies, and small businesses.
   ```

**Submit to Play Store:**
1. Go to https://play.google.com/console
2. Create new application
3. Upload APK (or AAB file)
4. Add screenshots and graphics
5. Fill out store listing
6. Submit for review

**Review time:** Usually 1-3 days

---

## Final Checklist

Before going live:

- [ ] All icons generated (8 required + 2 maskable)
- [ ] Service worker working locally
- [ ] Lighthouse PWA score 90+
- [ ] Environment variables configured
- [ ] App deployed to production with HTTPS
- [ ] PWA installable on desktop/mobile browsers
- [ ] APK generated and tested on Android device
- [ ] All features working in APK
- [ ] Offline mode tested
- [ ] Database accessible from production
- [ ] (Optional) Play Store assets prepared

---

## Support & Resources

**Documentation:**
- [PWA_SETUP_GUIDE.md](PWA_SETUP_GUIDE.md) - Complete PWA setup
- [ICON_GENERATION.md](ICON_GENERATION.md) - Icon creation guide
- [DEPLOY.md](DEPLOY.md) - Deployment instructions

**Check PWA Status:**
```bash
.\check-pwa.ps1
```

**Useful Links:**
- PWA Builder: https://www.pwabuilder.com/
- Lighthouse: Chrome DevTools → Lighthouse
- Manifest Validator: https://manifest-validator.appspot.com/
- Service Worker Test: Chrome DevTools → Application → Service Workers

---

## Troubleshooting

**PWA Builder can't detect my app:**
- Verify manifest.json is accessible at `/manifest.json`
- Check service worker is registered
- Ensure site uses HTTPS

**APK won't install:**
- Enable "Unknown Sources" in Android settings
- Check Android version compatibility (min: Android 5.0+)

**App crashes on Android:**
- Check browser console for errors
- Verify API endpoints are accessible
- Check database connection

**Features not working offline:**
- Service worker may not be caching correctly
- Check Network tab in DevTools
- Verify cache strategy in service-worker.js

---

**Need help?** Check the detailed guides in the documentation folder.

**Ready to deploy?** Start with Step 1! 🚀
