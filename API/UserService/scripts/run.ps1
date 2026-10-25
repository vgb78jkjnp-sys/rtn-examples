# Starts the RTN UserService for local development (http://localhost:5293).
#
#   powershell -ExecutionPolicy Bypass -File ".\scripts\run.ps1"

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$project = Join-Path $projectDir "UserService.csproj"
$nugetConfig = Join-Path $projectDir "NuGet.config"

if (-not (Test-Path $project)) {
    throw "Project not found: $project"
}

Set-Location $projectDir

Write-Host "Restoring UserService..." -ForegroundColor Cyan
dotnet restore $project --configfile $nugetConfig
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting UserService at http://localhost:5293 (Development)..." -ForegroundColor Green
dotnet run --project $project --launch-profile http
