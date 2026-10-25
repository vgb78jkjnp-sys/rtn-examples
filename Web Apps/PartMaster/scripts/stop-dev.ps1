##
# Stops ApiGateway, UserService, PartService, and PartMaster (Vite) from the local dev stack.
#
# powershell -ExecutionPolicy Bypass -File "c:\Users\rnorman\source\repos\Web Apps\PartMaster\scripts\stop-dev.ps1"
#

$ErrorActionPreference = "Continue"

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

function Get-HostShellProcessId {
    param([int]$ProcessId)

    $currentId = $ProcessId
    while ($currentId) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId=$currentId" -ErrorAction SilentlyContinue
        if (-not $process) {
            return $null
        }

        if ($process.Name -match '^(powershell|pwsh)\.exe$') {
            return $currentId
        }

        if ($process.ParentProcessId -eq 0 -or $process.ParentProcessId -eq $currentId) {
            break
        }

        $currentId = $process.ParentProcessId
    }

    return $null
}

function Stop-ProcessTree {
    param([int]$ProcessId)

    if ($ProcessId -le 4) {
        return $false
    }

    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $process) {
        return $false
    }

    $hostShellPid = Get-HostShellProcessId -ProcessId $ProcessId
    if ($hostShellPid) {
        Write-Host "Closing $($process.ProcessName) host window (PID $hostShellPid)..." -ForegroundColor Yellow
        Stop-Process -Id $hostShellPid -Force -ErrorAction SilentlyContinue
        return $true
    }

    Write-Host "Stopping $($process.ProcessName) (PID $ProcessId)..." -ForegroundColor Yellow
    Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    return $true
}

function Stop-ProcessByNameIfRunning {
    param([string]$ProcessName)

    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if (-not $processes) {
        return $false
    }

    $stopped = $false
    foreach ($process in $processes) {
        if (Stop-ProcessTree -ProcessId $process.Id) {
            $stopped = $true
        }
    }

    if ($stopped) {
        Start-Sleep -Seconds 2
    }

    return $stopped
}

function Stop-ListenerOnPort {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $connections) {
        return $false
    }

    $stopped = $false
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 4 }
    foreach ($processId in $processIds) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if (-not $process) {
            continue
        }

        Write-Host "Stopping $($process.ProcessName) on port $Port (PID $processId)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        $stopped = $true
    }

    if ($stopped) {
        Start-Sleep -Seconds 2
    }

    return $stopped
}

function Stop-DevStackHostWindows {
    $hostWindowPatterns = @(
        $apiGatewayProject,
        $userServiceProject,
        $partServiceProject,
        "npm run dev"
    )

    $stopped = $false
    $shellProcesses = @(
        Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue
        Get-CimInstance Win32_Process -Filter "Name='pwsh.exe'" -ErrorAction SilentlyContinue
    )

    foreach ($shell in $shellProcesses) {
        if (-not $shell) {
            continue
        }

        foreach ($pattern in $hostWindowPatterns) {
            if ($shell.CommandLine -and $shell.CommandLine -like "*$pattern*") {
                Write-Host "Closing dev stack window (PID $($shell.ProcessId))..." -ForegroundColor Yellow
                Stop-Process -Id $shell.ProcessId -Force -ErrorAction SilentlyContinue
                $stopped = $true
                break
            }
        }
    }

    if ($stopped) {
        Start-Sleep -Seconds 1
    }

    return $stopped
}

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

Write-Host "Stopping local Part Master stack..." -ForegroundColor Cyan

$stoppedSomething = $false

if (Stop-ProcessByNameIfRunning -ProcessName "ApiGateway") { $stoppedSomething = $true }
if (Stop-ProcessByNameIfRunning -ProcessName "UserService") { $stoppedSomething = $true }
if (Stop-ProcessByNameIfRunning -ProcessName "PartService") { $stoppedSomething = $true }
if (Stop-DevStackHostWindows) { $stoppedSomething = $true }
if (Stop-ListenerOnPort -Port $apiGatewayPort) { $stoppedSomething = $true }
if (Stop-ListenerOnPort -Port $userServicePort) { $stoppedSomething = $true }
if (Stop-ListenerOnPort -Port $partServicePort) { $stoppedSomething = $true }
if (Stop-ListenerOnPort -Port $vitePort) { $stoppedSomething = $true }

Stop-ProcessByNameIfRunning -ProcessName "ApiGateway" | Out-Null
Stop-ProcessByNameIfRunning -ProcessName "UserService" | Out-Null
Stop-ProcessByNameIfRunning -ProcessName "PartService" | Out-Null
Stop-ListenerOnPort -Port $apiGatewayPort | Out-Null
Stop-ListenerOnPort -Port $userServicePort | Out-Null
Stop-ListenerOnPort -Port $partServicePort | Out-Null
Stop-ListenerOnPort -Port $vitePort | Out-Null

$portsFree = @(
    (Wait-ForPortFree -Port $apiGatewayPort),
    (Wait-ForPortFree -Port $userServicePort),
    (Wait-ForPortFree -Port $partServicePort),
    (Wait-ForPortFree -Port $vitePort)
) -notcontains $false

Write-Host ""
if ($stoppedSomething -or $portsFree) {
    if ($portsFree) {
        Write-Host "Stack stopped." -ForegroundColor Green
    } else {
        Write-Host "Stack partially stopped. Ports may still be in use:" -ForegroundColor Yellow
        foreach ($port in @($apiGatewayPort, $userServicePort, $partServicePort, $vitePort)) {
            $stillListening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
            if ($stillListening) {
                Write-Host "  Port $port still in use." -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "No running stack processes found." -ForegroundColor Gray
}
