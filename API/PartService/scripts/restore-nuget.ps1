# Restores NuGet packages for PartService (RTN.Framework from rtn-samples SharedPackages).
#   powershell -ExecutionPolicy Bypass -File scripts\restore-nuget.ps1

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$nugetConfig = Join-Path $projectDir 'NuGet.config'

if (-not (Test-Path $nugetConfig)) {
    Write-Error "NuGet.config not found: $nugetConfig"
}

$env:NUGET_PACKAGES = Join-Path $env:USERPROFILE '.nuget\packages'

Push-Location $projectDir
try {
    dotnet restore PartService.sln --configfile NuGet.config
    if ($LASTEXITCODE -ne 0) {
        Write-Error "dotnet restore failed. Ensure RTN.Framework is in ..\..\SharedPackages (pack RTN.Framework Release if needed)."
    }
    Write-Host "NuGet restore succeeded." -ForegroundColor Green
}
finally {
    Pop-Location
}
