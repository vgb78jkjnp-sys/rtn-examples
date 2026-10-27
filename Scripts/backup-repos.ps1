# Archive repos_backup (all subfolders) with 7-Zip; excludes .git directories.
#   powershell -ExecutionPolicy Bypass -File C:\Users\rnorman\source\backup-repos.ps1

$ErrorActionPreference = 'Stop'

$sevenZip = @(
    (Get-Command 7z -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue)
    (Join-Path $env:ProgramFiles '7-Zip\7z.exe')
    (Join-Path ${env:ProgramFiles(x86)} '7-Zip\7z.exe')
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1

if (-not $sevenZip) {
    Write-Error '7-Zip not found. Install from https://www.7-zip.org/ or add 7z.exe to PATH.'
}

$sourceDir = $PSScriptRoot
$root = Join-Path $sourceDir 'repos_backup'
$dateStamp = Get-Date -Format 'yyyy-MM-dd'
$archive = Join-Path $sourceDir "repos_backup_$dateStamp.7z"

if (-not (Test-Path -LiteralPath $root)) {
    Write-Error "Folder not found: $root"
}

if (Test-Path -LiteralPath $archive) {
    $answer = Read-Host "Archive already exists: $archive`nOverwrite? [y/N]"
    if ($answer -notmatch '^[yY]') {
        Write-Host 'Cancelled.'
        exit 0
    }
    Remove-Item -LiteralPath $archive -Force
}

Write-Host "Creating archive..." -ForegroundColor Cyan
Write-Host "  Source: $root"
Write-Host "  Output: $archive"

Push-Location $sourceDir
try {
    & $sevenZip a -t7z $archive $root '-xr!.git' -mx=5
    if ($LASTEXITCODE -ne 0) {
        Write-Error "7-Zip failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

$sizeMb = [math]::Round((Get-Item -LiteralPath $archive).Length / 1MB, 2)
Write-Host ""
Write-Host "Done: $archive ($sizeMb MB)" -ForegroundColor Green
