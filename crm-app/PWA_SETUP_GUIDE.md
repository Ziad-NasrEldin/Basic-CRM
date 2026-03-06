# PWA Setup Guide for MaVoid CRM

## ✅ What's Been Configured

Your Next.js CRM app is now ready for PWA Builder conversion! Here's what was set up:

### 1. **Web App Manifest** (`/public/manifest.json`)
- Complete app metadata (name, description, colors)
- Icon definitions for all required sizes
- App shortcuts (New Client, Analytics)
- Display mode: standalone (looks like native app)
- Theme color: #1B6C98 (your brand blue)
- RTL support for Arabic

### 2. **Service Worker** (`/public/service-worker.js`)
- Offline functionality
- Cache-first strategy for assets
- Network-first for pages
- Always fresh API data
- Push notification support (ready for future use)

### 3. **Updated Layout** (`/app/layout.js`)
- Meta tags for iOS (Apple) support
- Android PWA support
- Theme color configuration
- Viewport settings
- Service worker registration

### 4. **Browser Config** (`/public/browserconfig.xml`)
- Windows tile configuration
- Microsoft Edge support

---

## 🎨 **REQUIRED: Create App Icons**

You need to create PNG icons in the following sizes. Use your `mavoid-logo.png` as the base:

### Required Icon Sizes:
```
/public/icon-72x72.png
/public/icon-96x96.png
/public/icon-128x128.png
/public/icon-144x144.png
/public/icon-152x152.png
/public/icon-192x192.png
/public/icon-384x384.png
/public/icon-512x512.png
```

### Maskable Icons (with safe zone):
```
/public/icon-maskable-192x192.png
/public/icon-maskable-512x512.png
```

### Tools to Generate Icons:

1. **PWA Asset Generator** (Recommended - CLI tool):
   ```bash
   npx @pwa/asset-generator public/mavoid-logo.png public --icon-only --path-override / --manifest public/manifest.json
   ```

2. **Online Tools**:
   - https://www.pwabuilder.com/imageGenerator - Upload your logo
   - https://favicon.io/ - Generate all sizes
   - https://realfavicongenerator.net/ - Comprehensive generator

3. **Manual Creation**:
   - Use Photoshop/Figma/Canva
   - Export in each size with transparent background
   - For maskable icons, add 10% padding/safe zone around the logo

---

## 📸 **OPTIONAL: Add Screenshots**

For better app store presentation (when using PWA Builder):

Create screenshots and place in `/public/`:
- `screenshot-mobile.png` (540x720px) - Mobile view
- `screenshot-desktop.png` (1280x720px) - Desktop view

Take screenshots of:
- Main clients page (kanban view)
- Client details page
- Analytics dashboard

---

## 🚀 **Testing Your PWA**

### Local Testing:

1. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

2. **Test Service Worker** (must use HTTPS or localhost):
   - Open Chrome DevTools → Application tab
   - Check "Service Workers" section
   - Verify service worker is registered

3. **Test Manifest**:
   - Chrome DevTools → Application → Manifest
   - Verify all fields are loaded correctly

4. **Test Installation**:
   - Chrome: Look for install button in address bar
   - Or use Chrome DevTools → Application → Install

### PWA Audit:

Run Lighthouse in Chrome DevTools:
```
Right-click → Inspect → Lighthouse tab → Progressive Web App
```

Target score: **100/100**

---

## 🔧 **Using PWA Builder**

### Step 1: Deploy Your App

Deploy to a platform with HTTPS (required for PWA):
- **Vercel** (recommended for Next.js): `vercel deploy`
- **Netlify**: Connect GitHub repo
- **Railway**: Docker deployment
- **AWS/Azure**: Manual deployment

### Step 2: Generate APK

1. Go to https://www.pwabuilder.com/
2. Enter your deployed URL (e.g., `https://your-app.vercel.app`)
3. Click "Start"
4. Review the manifest (should auto-detect)
5. Click "Package for Stores"
6. Select "Android" → Generate
7. Download your APK!

### PWA Builder Checklist:
- ✅ Service Worker registered
- ✅ Manifest linked properly
- ✅ Icons available (all sizes)
- ✅ HTTPS enabled
- ✅ Responsive design
- ✅ Offline support

---

## 📱 **APK Options**

PWA Builder offers two Android options:

1. **Trusted Web Activity (TWA)** - Recommended
   - Google Play Store ready
   - Full browser features
   - Automatic updates from web
   - Requires Digital Asset Links for Play Store

2. **WebView**
   - Works without asset links
   - Good for side-loading
   - Manual updates needed

---

## 🔐 **Google Play Store Deployment**

If publishing to Play Store (after generating APK):

1. **Create keystore** (for signing):
   ```bash
   keytool -genkey -v -keystore mavoid-crm.keystore -alias mavoid -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Digital Asset Links**:
   - Add `.well-known/assetlinks.json` to your web server
   - Contains SHA-256 fingerprint of your app signing key

3. **Play Store Requirements**:
   - Privacy policy URL
   - App screenshots (from screenshots/ folder)
   - Feature graphic (1024x500px)
   - Privacy disclosures
   - Content rating

---

## ⚙️ **Additional Configuration**

### Update Service Worker Cache Version

When you make changes to the app, update cache version in `/public/service-worker.js`:
```javascript
const CACHE_NAME = 'mavoid-crm-v2'; // Increment version
```

### Add Offline Page (Optional)

Create `/app/offline/page.js` for better offline experience.

### Install Prompt (Optional)

Add an "Install App" button in your navbar:
```javascript
import { useEffect, useState } from 'react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  if (!deferredPrompt) return null;

  return (
    <button onClick={handleInstall}>Install App</button>
  );
}
```

---

## 🎯 **Next Steps**

1. ✅ Generate icons using one of the tools above
2. ✅ Build and test locally (`npm run build && npm start`)
3. ✅ Run Lighthouse audit (should score 90+ on PWA)
4. ✅ Deploy to production (Vercel/Netlify)
5. ✅ Test on real mobile device
6. ✅ Use PWA Builder to generate APK
7. ✅ Test APK on Android device
8. ✅ (Optional) Publish to Google Play Store

---

## 📚 **Resources**

- PWA Builder: https://www.pwabuilder.com/
- PWA Documentation: https://web.dev/progressive-web-apps/
- Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Manifest
- Next.js PWA: https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps

---

## ⚠️ **Important Notes**

### HTTPS Required
- PWA features **only work on HTTPS** (or localhost for testing)
- Make sure your production deployment uses HTTPS
- Most platforms (Vercel, Netlify) provide HTTPS by default

### Database Consideration
- Your app uses Prisma with PostgreSQL
- Make sure your production database is accessible
- Consider environment variables for database URL

### API Routes
- All `/api/*` routes bypass cache (always fresh data)
- Offline mode will show "API unavailable" messages
- Design UI to handle offline state gracefully

### File Size
- Keep service worker cache small
- Large assets should be lazy-loaded
- Consider CDN for fonts/images in production

---

## 🐛 **Troubleshooting**

**Service Worker not registering?**
- Check browser console for errors
- Verify HTTPS or localhost
- Clear browser cache and re-register

**Icons not showing?**
- Verify file paths match manifest.json
- Check file sizes are correct
- Use PNG format (not JPG)

**PWA Builder can't detect manifest?**
- Check manifest.json is accessible at `/manifest.json`
- Verify JSON syntax (use JSON validator)
- Check CORS headers if on different domain

**App not installable?**
- Run Lighthouse PWA audit
- Verify service worker is active
- Check manifest has required fields

---

Good luck with your app deployment! 🚀
