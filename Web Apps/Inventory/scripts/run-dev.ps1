##
# Starts ApiGateway, UserService, and Inventory (Vite) for local development.
#
# powershell -ExecutionPolicy Bypass -File "scripts\run-dev.ps1"
#

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$inventoryDir = Split-Path -Parent $scriptDir
$reposRoot = Split-Path -Parent (Split-Path -Parent $inventoryDir)
$apiRoot = Join-Path $reposRoot "API"

$apiGatewayProject = Join-Path $apiRoot "ApiGateway\ApiGateway.csproj"
$userServiceProject = Join-Path $apiRoot "UserService\UserService.csproj"

$apiGatewayPort = 5291
$userServicePort = 5293
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

if (-not (Test-Path (Join-Path $inventoryDir "package.json"))) {
    throw "Inventory not found: $inventoryDir"
}

Write-Host "Preparing local Inventory stack..." -ForegroundColor Cyan

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

foreach ($port in @($apiGatewayPort, $userServicePort, $vitePort)) {
    if (-not (Wait-ForPortFree -Port $port)) {
        throw "Port $port is still in use. Close the process manually or run stop-dev.ps1 again."
    }
}

Write-Host "Building ApiGateway..." -ForegroundColor Cyan
dotnet build $apiGatewayProject -c Debug --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "ApiGateway build failed." }

Write-Host "Building UserService..." -ForegroundColor Cyan
dotnet build $userServiceProject -c Debug --nologo -v q
if ($LASTEXITCODE -ne 0) { throw "UserService build failed." }

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

Write-Host "Starting Inventory on port $vitePort..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -WorkingDirectory $inventoryDir -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "npm run dev -- --port $vitePort"
)

if (-not (Wait-ForPort -Port $vitePort -Label "Inventory")) {
    throw "Inventory dev server failed to start. Check the npm PowerShell window for errors."
}

Write-Host ""
Write-Host "Verifying endpoints..." -ForegroundColor Cyan
Test-DevUrl -Url "http://localhost:$vitePort/apps/inventory/" -Label "Inventory SPA" | Out-Null

Write-Host ""
Write-Host "Stack is running:" -ForegroundColor Green
Write-Host "  ApiGateway:           http://localhost:$apiGatewayPort"
Write-Host "  UserService:          http://localhost:$userServicePort/api/userservice"
Write-Host "  Inventory app:        http://localhost:$vitePort/apps/inventory/"
Write-Host ""
Write-Host "Open the Inventory app URL above in your browser (include /apps/inventory/)."
