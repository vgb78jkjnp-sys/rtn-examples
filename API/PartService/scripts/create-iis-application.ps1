# Creates the PartService IIS application at /api/partservice.
# Run on the API/web server (e.g. pa-mfgweb-dev3) as Administrator after files
# are deployed to C:\inetpub\Mes\Api\PartService (api-dev pipeline).

param(
    [string]$SiteName = 'Default Web Site',
    [string]$VirtualPath = '/api/partservice',
    [string]$PhysicalPath = 'C:\inetpub\Mes\Api\PartService',
    [string]$AppPoolName = 'PartService'
)

$ErrorActionPreference = 'Stop'

Import-Module WebAdministration

if (-not (Test-Path $PhysicalPath)) {
    Write-Error "Physical path not found: $PhysicalPath. Deploy PartService first (api-dev pipeline)."
}

if (-not (Get-WebAppPoolState -Name $AppPoolName -ErrorAction SilentlyContinue)) {
    New-WebAppPool -Name $AppPoolName
    Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedRuntimeVersion -Value ''
    Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedPipelineMode -Value 'Integrated'
    Write-Host "Created app pool: $AppPoolName"
}

$sitePath = "IIS:\Sites\$SiteName"
if (-not (Test-Path $sitePath)) {
    Write-Error "IIS site not found: $SiteName"
}

$appSegment = $VirtualPath.Trim('/').Split('/')[-1]
$existing = Get-WebApplication -Site $SiteName | Where-Object { $_.Path -eq $VirtualPath }

if ($existing) {
    Set-ItemProperty "IIS:\Sites\$SiteName\$($VirtualPath.Trim('/').Replace('/', '\'))" -Name physicalPath -Value $PhysicalPath
    Set-ItemProperty "IIS:\Sites\$SiteName\$($VirtualPath.Trim('/').Replace('/', '\'))" -Name applicationPool -Value $AppPoolName
    Write-Host "Updated IIS application $VirtualPath"
} else {
    New-WebApplication -Site $SiteName -Name $appSegment -PhysicalPath $PhysicalPath -ApplicationPool $AppPoolName -VirtualPath $VirtualPath
    Write-Host "Created IIS application $VirtualPath -> $PhysicalPath"
}

Write-Host ""
Write-Host "PartService IIS application configured." -ForegroundColor Green
Write-Host "Test with POST to /api/partservice/GETPARTMASTERROWS"
