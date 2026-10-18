Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\kishore\.gemini\antigravity-ide\brain\a4f6c3c3-4c0d-4612-b033-08e133311ba6\.user_uploaded\media_1792301697267.jpg"
$src = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($img, $width, $height, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $width, $height)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $outPath"
}

# 1. Master logo & icon
Resize-Image $src 1024 1024 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\logo.png"
Resize-Image $src 1024 1024 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\icon.png"

# 2. PWA Icons
Resize-Image $src 512 512 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\icons\icon-512x512.png"
Resize-Image $src 192 192 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\icons\icon-192x192.png"
Resize-Image $src 512 512 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\icons\icon-maskable-512x512.png"
Resize-Image $src 192 192 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\icons\icon-maskable-192x192.png"
Resize-Image $src 180 180 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\icons\apple-touch-icon.png"
Resize-Image $src 48 48 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\favicon.png"
Resize-Image $src 48 48 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\public\favicon.ico"

# 3. Mobile assets
Resize-Image $src 1024 1024 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\mobile\assets\icon.png"
Resize-Image $src 512 512 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\mobile\assets\splash-icon.png"
Resize-Image $src 432 432 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\mobile\assets\android-icon-foreground.png"
Resize-Image $src 48 48 "d:\from-c-drive\OneDrive\Desktop\My-Pocket-Tracker\mobile\assets\favicon.png"

$src.Dispose()
Write-Host "All icons generated successfully!"
