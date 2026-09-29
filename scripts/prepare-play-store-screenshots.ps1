Add-Type -AssemblyName System.Drawing

$sourceDirectory = Join-Path $PSScriptRoot '..\assets\play-store'
$outputDirectory = Join-Path $sourceDirectory 'phone'

$screenshots = [ordered]@{
  '01-create-share-link.png' = 'Screenshot_20260927_234008_Docuflash.jpg'
  '02-my-uploads.png'       = 'Screenshot_20260929_221951_Docuflash.jpg'
  '03-upload-to-me.png'     = 'Screenshot_20260927_234023_Docuflash.jpg'
  '04-file-received.png'    = 'Screenshot_20260927_234452_Docuflash.jpg'
  '05-nearby.png'           = 'Screenshot_20260927_234137_Docuflash.jpg'
  '06-profile-settings.png' = 'Screenshot_20260929_222036_Docuflash.jpg'
}

$canvasWidth = 1080
$canvasHeight = 1920
$background = [System.Drawing.ColorTranslator]::FromHtml('#F7F3EA')

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

foreach ($item in $screenshots.GetEnumerator()) {
  $sourcePath = Join-Path $sourceDirectory $item.Value
  $outputPath = Join-Path $outputDirectory $item.Key

  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Missing screenshot: $sourcePath"
  }

  $source = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $scaledWidth = [int][Math]::Round($source.Width * ($canvasHeight / $source.Height))
    $x = [int][Math]::Floor(($canvasWidth - $scaledWidth) / 2)

    $canvas = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear($background)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle($x, 0, $scaledWidth, $canvasHeight)))
        $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $graphics.Dispose()
      }
    } finally {
      $canvas.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

Get-ChildItem -LiteralPath $outputDirectory -Filter '*.png' |
  Sort-Object Name |
  ForEach-Object {
    $image = [System.Drawing.Image]::FromFile($_.FullName)
    try {
      [pscustomobject]@{
        Name = $_.Name
        Dimensions = "$($image.Width)x$($image.Height)"
        SizeMB = [Math]::Round($_.Length / 1MB, 2)
      }
    } finally {
      $image.Dispose()
    }
  } |
  Format-Table -AutoSize
