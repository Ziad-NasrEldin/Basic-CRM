# PWA Readiness Check Script
# Run this to verify all required files are in place

Write-Host "`n🔍 Checking PWA Setup..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$allGood = $true

# Check manifest.json
Write-Host "📄 Checking manifest.json..." -NoNewline
if (Test-Path "public/manifest.json") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Missing!" -ForegroundColor Red
    $allGood = $false
}

# Check service worker
Write-Host "⚙️  Checking service-worker.js..." -NoNewline
if (Test-Path "public/service-worker.js") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Missing!" -ForegroundColor Red
    $allGood = $false
}

# Check service worker registration
Write-Host "📝 Checking sw-register.js..." -NoNewline
if (Test-Path "public/sw-register.js") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌ Missing!" -ForegroundColor Red
    $allGood = $false
}

# Check browserconfig.xml
Write-Host "🌐 Checking browserconfig.xml..." -NoNewline
if (Test-Path "public/browserconfig.xml") {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Missing (optional)" -ForegroundColor Yellow
}

# Check icons
Write-Host "`n🎨 Checking App Icons:" -ForegroundColor Cyan

$requiredIcons = @(
    "icon-72x72.png",
    "icon-96x96.png",
    "icon-128x128.png",
    "icon-144x144.png",
    "icon-152x152.png",
    "icon-192x192.png",
    "icon-384x384.png",
    "icon-512x512.png"
)

$maskableIcons = @(
    "icon-maskable-192x192.png",
    "icon-maskable-512x512.png"
)

$missingIcons = @()

foreach ($icon in $requiredIcons) {
    Write-Host "   $icon..." -NoNewline
    if (Test-Path "public/$icon") {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌" -ForegroundColor Red
        $missingIcons += $icon
        $allGood = $false
    }
}

Write-Host "`n   Maskable Icons (optional but recommended):" -ForegroundColor Yellow
foreach ($icon in $maskableIcons) {
    Write-Host "   $icon..." -NoNewline
    if (Test-Path "public/$icon") {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Missing" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ PWA Setup Complete!" -ForegroundColor Green
    Write-Host "`nYou're ready to:" -ForegroundColor Green
    Write-Host "  1. Build: npm run build" -ForegroundColor White
    Write-Host "  2. Test: npm start" -ForegroundColor White
    Write-Host "  3. Deploy to production" -ForegroundColor White
    Write-Host "  4. Use PWA Builder to generate APK" -ForegroundColor White
} else {
    Write-Host "❌ PWA Setup Incomplete!" -ForegroundColor Red
    Write-Host "`nMissing files:" -ForegroundColor Yellow
    
    if ($missingIcons.Count -gt 0) {
        Write-Host "`n🎨 Generate icons using:" -ForegroundColor Cyan
        Write-Host "   npx @pwa/asset-generator public/mavoid-logo.png public --icon-only" -ForegroundColor White
        Write-Host "`n   Or visit: https://www.pwabuilder.com/imageGenerator" -ForegroundColor White
        Write-Host "`n   See ICON_GENERATION.md for detailed instructions" -ForegroundColor White
    }
}

Write-Host "`n📚 For detailed setup guide, see: PWA_SETUP_GUIDE.md`n" -ForegroundColor Cyan
