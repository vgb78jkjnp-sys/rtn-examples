# Restore (if needed) and build PartService Release output to bin\Release\net8.0\
#   powershell -ExecutionPolicy Bypass -File scripts\build-release.ps1

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir

& (Join-Path $scriptDir 'restore-nuget.ps1')

Push-Location $projectDir
try {
    Write-Host "Building Release..." -ForegroundColor Cyan
    dotnet build PartService.sln -c Release --no-restore
    if ($LASTEXITCODE -ne 0) {
        Write-Error "dotnet build failed."
    }
    Write-Host ""
    Write-Host "Build output:" -ForegroundColor Green
    Write-Host "  $projectDir\bin\Release\net8.0\"
}
finally {
    Pop-Location
}
