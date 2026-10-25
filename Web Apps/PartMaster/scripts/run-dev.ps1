##
# Starts ApiGateway, UserService, PartService, and PartMaster for local development.
#
# powershell -ExecutionPolicy Bypass -File "c:\Users\rnorman\source\repos\Web Apps\PartMaster\scripts\run-dev.ps1"
#

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$partMasterDir = Split-Path -Parent $scriptDir
$rtnSamplesRoot = Split-Path -Parent (Split-Path -Parent $partMasterDir)
$apiRoot = Join-Path $rtnSamplesRoot "API"

$apiGatewayProject = Join-Path $apiRoot "ApiGateway\ApiGateway.csproj"
$userServiceProject = Join-Path $apiRoot "UserService\UserService.csproj"
$partServiceProject = Join-Path $apiRoot "PartService\PartService.csproj"

$apiGatewayPort = 5291
$userServicePort = 5293
$partServicePort = 5299
$vitePort = 5173

function Wait-ForPort {
    param(
        [int]$Port,
        [string]$Label,
        [int]$TimeoutSeconds = 45
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($listening) {
            Write-Host "$Label is listening on port $Port." -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 1
    }

    Write-Host "$Label did not start on port $Port within ${TimeoutSeconds}s." -ForegroundColor Red
    return $false
}

function Test-DevUrl {
    param(
        [string]$Url,
        [string]$Label
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        Write-Host "$Label responded HTTP $($response.StatusCode) at $Url" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "$Label failed at $Url : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

if (-not (Test-Path $apiGatewayProject)) {
    throw "ApiGateway project not found: $apiGatewayProject"
}

if (-not (Test-Path $userServiceProject)) {
    throw "UserService project not found: $userServiceProject"
}

if (-not (Test-Path $partServiceProject)) {
    throw "PartService project not found: $partServiceProject"
}

if (-not (Test-Path (Join-Path $partMasterDir "package.json"))) {
    throw "PartMaster not found: $partMasterDir"
}

Write-Host "Preparing local Part Master stack..." -ForegroundColor Cyan

& (Join-Path $scriptDir "stop-dev.ps1")

Start-Sleep -Seconds 2

function Wait-ForPortFree {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 20
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if (-not $listening) {
            return $true
        }
        Start-Sleep -Seconds 1
    }

    return $false
}

foreach ($port in @($apiGatewayPort, $userServicePort, $partServicePort, $vitePort)) {
    if (-not (Wait-ForPortFree -Port $port)) {
        throw "Port $port is still in use. Close the process manually or run stop-dev.ps1 again."
    }
}

$userServiceDir = Split-Path -Parent $userServiceProject
$partServiceDir = Split-Path -Parent $partServiceProject
$userNugetConfig = Join-Path $userServiceDir "NuGet.config"
$partNugetConfig = Join-Path $partServiceDir "NuGet.config"

Write-Host "Restoring API projects..." -ForegroundColor Cyan
dotnet restore $apiGatewayProject --ignore-failed-sources --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "ApiGateway restore failed." }
dotnet restore $userServiceProject --configfile $userNugetConfig --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "UserService restore failed." }
dotnet restore $partServiceProject --configfile $partNugetConfig --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "PartService restore failed." }

Write-Host "Building ApiGateway..." -ForegroundColor Cyan
dotnet build $apiGatewayProject -c Debug --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "ApiGateway build failed." }

Write-Host "Building UserService..." -ForegroundColor Cyan
dotnet build $userServiceProject -c Debug --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "UserService build failed." }

Write-Host "Building PartService..." -ForegroundColor Cyan
dotnet build $partServiceProject -c Debug --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "PartService build failed." }

Write-Host "Starting UserService on port $userServicePort..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "dotnet run --project '$userServiceProject' --launch-profile http --no-build"
)

if (-not (Wait-ForPort -Port $userServicePort -Label "UserService")) {
    throw "UserService failed to start. Check the UserService PowerShell window for errors."
}

Write-Host "Starting PartService on port $partServicePort..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "dotnet run --project '$partServiceProject' --launch-profile http --no-build"
)

if (-not (Wait-ForPort -Port $partServicePort -Label "PartService")) {
    throw "PartService failed to start. Check the PartService PowerShell window for errors."
}

Write-Host "Starting ApiGateway on port $apiGatewayPort..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "dotnet run --project '$apiGatewayProject' --launch-profile http --no-build"
)

if (-not (Wait-ForPort -Port $apiGatewayPort -Label "ApiGateway")) {
    throw "ApiGateway failed to start. Check the ApiGateway PowerShell window for errors."
}

Write-Host "Starting PartMaster on port $vitePort..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -WorkingDirectory $partMasterDir -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "npm run dev -- --port $vitePort"
)

if (-not (Wait-ForPort -Port $vitePort -Label "PartMaster")) {
    throw "PartMaster dev server failed to start. Check the npm PowerShell window for errors."
}

Write-Host ""
Write-Host "Verifying endpoints..." -ForegroundColor Cyan
Test-DevUrl -Url "http://localhost:$vitePort/apps/partmaster/" -Label "PartMaster SPA" | Out-Null
try {
    $apiResult = Invoke-RestMethod -Method Post -Uri "http://localhost:$apiGatewayPort/api/partservice/GETPARTMASTERROWS" -ContentType "application/json" -Body '{"PartId":"%","VendorLot":"%","VendorShipLot":"%","PartNumber":"%","MaxRows":1}' -TimeoutSec 30
    if ($apiResult.Status -eq "success") {
        Write-Host "ApiGateway proxied PartService successfully." -ForegroundColor Green
    } else {
        Write-Host "ApiGateway returned unexpected status: $($apiResult.Status)" -ForegroundColor Red
    }
} catch {
    Write-Host "ApiGateway proxy check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Stack is running:" -ForegroundColor Green
Write-Host "  ApiGateway:           http://localhost:$apiGatewayPort"
Write-Host "  UserService:          http://localhost:$userServicePort/api/userservice"
Write-Host "  PartService:          http://localhost:$partServicePort/api/partservice"
Write-Host "  PartMaster app:       http://localhost:$vitePort/apps/partmaster/"
Write-Host ""
Write-Host "Open the PartMaster app URL above in your browser (include /apps/partmaster/)."
