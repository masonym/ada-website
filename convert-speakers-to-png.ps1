# PowerShell script to convert WebP speaker images to PNG for PDF compatibility
# Requires ImageMagick or similar tool to be installed

$sourceDir = "public\speakers"
$targetDir = "public\speakers\png"

# Create target directory if it doesn't exist
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force
}

# Get all WebP files in the source directory
$webpFiles = Get-ChildItem -Path $sourceDir -Filter "*.webp"

Write-Host "Found $($webpFiles.Count) WebP files to convert"

foreach ($file in $webpFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $targetFile = Join-Path $targetDir "$baseName.png"
    
    Write-Host "Converting $($file.Name) to PNG..."
    
    # Using ImageMagick (install with: winget install ImageMagick.ImageMagick)
    magick "$($file.FullName)" "$targetFile"
    
    # Alternative: Using .NET System.Drawing (if available)
    Add-Type -AssemblyName System.Drawing
    $image = [System.Drawing.Image]::FromFile($file.FullName)
    $image.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $image.Dispose()
    
    Write-Host "Converted $($file.Name) to PNG and placed in $targetDir"
}

Write-Host "Conversion process complete!"
