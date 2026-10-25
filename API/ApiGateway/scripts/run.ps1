# Starts the RTN ApiGateway for local development (http://localhost:5291).
#
#   powershell -ExecutionPolicy Bypass -File ".\scripts\run.ps1"

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$project = Join-Path $projectDir "ApiGateway.csproj"

if (-not (Test-Path $project)) {
    throw "Project not found: $project"
}

Set-Location $projectDir

Write-Host "Restoring ApiGateway..." -ForegroundColor Cyan
dotnet restore $project --ignore-failed-sources
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting ApiGateway at http://localhost:5291 (Development)..." -ForegroundColor Green
dotnet run --project $project --launch-profile http
