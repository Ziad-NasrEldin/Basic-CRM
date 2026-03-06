# Icon Generator Script
# Generates all required PWA icon sizes from mavoid-logo.png

Add-Type -AssemblyName System.Drawing

$scriptDir = $PSScriptRoot
$publicDir = Join-Path $scriptDir "public"
$sourcePath = Join-Path $publicDir "mavoid-logo.png"
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host "`n🎨 Generating PWA Icons from mavoid-logo.png..." -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

if (-not (Test-Path $sourcePath)) {
    Write-Host "❌ Error: mavoid-logo.png not found in public folder!" -ForegroundColor Red
    Write-Host "Looking in: $sourcePath" -ForegroundColor Yellow
    exit 1
}

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($size in $sizes) {
    $outputPath = Join-Path $publicDir "icon-${size}x${size}.png"
    Write-Host "Generating icon-${size}x${size}.png..." -NoNewline
    
    try {
        $bitmap = New-Object System.Drawing.Bitmap $size, $size
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # High quality settings
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Draw image
        $graphics.DrawImage($sourceImage, 0, 0, $size, $size)
        
        # Save as PNG
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $bitmap.Dispose()
        
        Write-Host " ✅" -ForegroundColor Green
    }
    catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
    }
}

$sourceImage.Dispose()

# Create maskable icons (with padding)
Write-Host "`nGenerating maskable icons..." -ForegroundColor Cyan

foreach ($size in @(192, 512)) {
    $outputPath = Join-Path $publicDir "icon-maskable-${size}x${size}.png"
    Write-Host "Generating icon-maskable-${size}x${size}.png..." -NoNewline
    
    try {
        $bitmap = New-Object System.Drawing.Bitmap $size, $size
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        
        # High quality settings
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Fill with white background
        $graphics.Clear([System.Drawing.Color]::White)
        
        # Calculate padding (10% safe zone)
        $padding = [Math]::Floor($size * 0.1)
        $innerSize = $size - ($padding * 2)
        
        # Load source and draw with padding
        $sourceImg = [System.Drawing.Image]::FromFile($sourcePath)
        $graphics.DrawImage($sourceImg, $padding, $padding, $innerSize, $innerSize)
        $sourceImg.Dispose()
        
        # Save as PNG
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $bitmap.Dispose()
        
        Write-Host " ✅" -ForegroundColor Green
    }
    catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ All icons generated successfully!" -ForegroundColor Green
Write-Host "`nRun check-pwa.ps1 to verify all icons are in place.`n" -ForegroundColor Cyan
