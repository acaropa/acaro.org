$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$scanner = Join-Path $repoRoot '.tools/sonarqube/sonar-scanner-8.1.0.6389/bin/sonar-scanner.bat'
if (-not (Test-Path $scanner)) { throw 'Instala SonarScanner: docs/sonarqube.md.' }
$savedToken = Join-Path $repoRoot '.tools/sonarqube/token.xml'
if (-not $env:SONAR_TOKEN -and (Test-Path $savedToken)) {
    $env:SONAR_TOKEN = (Import-Clixml $savedToken).GetNetworkCredential().Password
}
if (-not $env:SONAR_TOKEN) { throw 'Define SONAR_TOKEN con un token de analisis del proyecto.' }
if (-not $env:SONAR_HOST_URL) { $env:SONAR_HOST_URL = 'http://localhost:9000' }
$env:SONAR_USER_HOME = Join-Path $repoRoot '.tools/sonarqube/scanner-cache'
Push-Location $repoRoot
try {
    # Windows PowerShell treats redirected native stderr as errors, including JVM warnings.
    $ErrorActionPreference = 'Continue'
    & $scanner '-Dsonar.scanner.skipJreProvisioning=true'
    $ErrorActionPreference = 'Stop'
    if ($LASTEXITCODE -ne 0) { throw "SonarScanner termino con codigo $LASTEXITCODE." }
    $report = Get-Content '.scannerwork/report-task.txt' -Raw | ConvertFrom-StringData
    $deadline = (Get-Date).AddMinutes(5)
    do {
        $task = (Invoke-RestMethod -Uri $report.ceTaskUrl -Headers @{ Authorization = "Bearer $env:SONAR_TOKEN" }).task
        if ($task.status -eq 'SUCCESS') { break }
        if ($task.status -in @('FAILED', 'CANCELED')) { throw "SonarQube: $($task.status). $($task.errorMessage)" }
        if ((Get-Date) -gt $deadline) { throw 'Tiempo de espera agotado al procesar el informe.' }
        Start-Sleep -Seconds 2
    } while ($true)
    Write-Host "Informe procesado correctamente: $($report.dashboardUrl)"
} finally {
    $ErrorActionPreference = 'Stop'
    Pop-Location
}
