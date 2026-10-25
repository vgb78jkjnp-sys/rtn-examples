# Build PartService for local development (Debug -> bin\Debug\net8.0\).
# If restore fails with NU1301, run scripts\restore-nuget.ps1 first in an interactive window.
#   powershell -ExecutionPolicy Bypass -File scripts\build-debug.ps1

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir

$env:NUGET_PACKAGES = Join-Path $env:USERPROFILE '.nuget\packages'

Push-Location $projectDir
try {
    if (-not (Test-Path 'obj\project.assets.json')) {
        & (Join-Path $scriptDir 'restore-nuget.ps1')
    }

    Write-Host "Building Debug..." -ForegroundColor Cyan
    dotnet build PartService.sln -c Debug
    if ($LASTEXITCODE -ne 0) {
        Write-Error "dotnet build failed."
    }

    Write-Host ""
    Write-Host "Local dev output:" -ForegroundColor Green
    Write-Host "  $projectDir\bin\Debug\net8.0\"
    Write-Host ""
    Write-Host "Run API:" -ForegroundColor Green
    Write-Host "  dotnet run --project PartService.csproj --launch-profile http"
    Write-Host "  -> http://localhost:5299/api/partservice"
}
finally {
    Pop-Location
}
