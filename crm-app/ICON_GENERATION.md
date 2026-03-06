# Quick Icon Generation Guide

## Option 1: Using PWA Asset Generator (Fastest)

Install and run the PWA asset generator:

```bash
# Install globally
npm install -g @pwa/asset-generator

# Generate all icons from your logo
pwa-asset-generator public/mavoid-logo.png public/icons --icon-only --path-override / --background "#FFFFFF" --favicon
```

This will create all required icon sizes automatically!

## Option 2: Using Online Tool (Easiest)

1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload your `public/mavoid-logo.png`
3. Select "Generate Icons"
4. Download the ZIP file
5. Extract all PNG files to `/public/` folder

## Option 3: Using Favicon.io

1. Go to: https://favicon.io/favicon-converter/
2. Upload `public/mavoid-logo.png` (ideally 512x512 or larger)
3. Select all sizes needed
4. Download and extract to `/public/`

## Option 4: Manual Creation (Photoshop/Figma)

Export your logo in these exact sizes:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192 (Apple touch icon)
- 384x384
- 512x512 (main app icon)

**For maskable icons (192x192 and 512x512):**
- Add 10% padding around your logo
- Keep important content in the center 80%
- Test at: https://maskable.app/

## Naming Convention

Save files as:
```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
icon-maskable-192x192.png
icon-maskable-512x512.png
```

## Quick Check

After generating, verify all icons exist:
```bash
# Windows PowerShell
Get-ChildItem public/icon-*.png

# Should show 10 files
```

## Test Icons

Build and run locally:
```bash
npm run build
npm start
```

Open Chrome DevTools → Application → Manifest to verify all icons load correctly.
