$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$server = Join-Path $repoRoot '.tools/sonarqube/sonarqube-26.9.0.129388'
if (-not (Test-Path "$server/bin/windows-x86-64/StartSonar.bat")) {
    throw 'SonarQube no esta instalado. Consulta docs/sonarqube.md.'
}
try {
    $status = Invoke-RestMethod 'http://localhost:9000/api/system/status' -TimeoutSec 5
    Write-Host "SonarQube: $($status.status) - http://localhost:9000"
    return
} catch { }
Start-Process -FilePath "$server/bin/windows-x86-64/StartSonar.bat" -WorkingDirectory $server -WindowStyle Hidden
Write-Host "SonarQube iniciando: http://localhost:9000. Logs: $server/logs"
