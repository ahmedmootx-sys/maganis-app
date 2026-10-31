Add-Type -AssemblyName System.Drawing

$brandingDir = (Resolve-Path "public/branding").Path
$files = Get-ChildItem "$brandingDir/*.png"

foreach ($file in $files) {
    if ($file.Length -gt 150KB) {
        $origPath = $file.FullName
        $bytes = [System.IO.File]::ReadAllBytes($origPath)
        $ms = New-Object System.IO.MemoryStream(,$bytes)
        $orig = [System.Drawing.Bitmap]::FromStream($ms)
        $origW = $orig.Width
        $origH = $orig.Height

        # Determine target max dimension
        $maxDim = 400
        if ($file.Name -like "*icon*" -or $file.Name -like "*badge*" -or $file.Name -like "*mascot*" -or $file.Name -like "*welcome*") {
            $maxDim = 256
        }

        $scale = [Math]::Min($maxDim / $origW, $maxDim / $origH)
        if ($scale -ge 1.0) {
            $scale = 0.9
        }
        $newW = [int]($origW * $scale)
        $newH = [int]($origH * $scale)

        $resized = New-Object System.Drawing.Bitmap($newW, $newH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics = [System.Drawing.Graphics]::FromImage($resized)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $graphics.DrawImage($orig, 0, 0, $newW, $newH)
        $graphics.Dispose()
        $orig.Dispose()
        $ms.Dispose()

        $tempOut = "$brandingDir/temp_$($file.Name)"
        $resized.Save($tempOut, [System.Drawing.Imaging.ImageFormat]::Png)
        $resized.Dispose()

        $newSize = (Get-Item $tempOut).Length
        Move-Item -Force $tempOut $origPath

        Write-Output "$($file.Name): $($file.Length) bytes -> $newSize bytes ($([math]::Round($newSize/1024, 1)) KB)"
    } else {
        Write-Output "$($file.Name): $($file.Length) bytes (already <= 150KB)"
    }
}
