param(
  [ValidateSet("quick", "standard", "deep")]
  [string] $ScanMode = "quick",
  [decimal] $MaxBudget = 10,
  [int] $MaxTurns = 80
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$strix = Join-Path $repoRoot ".tools\strix\strix-1.4.1-windows-x86_64.exe"

if (-not (Test-Path -LiteralPath $strix)) {
  throw "Strix executable not found at $strix. Install it first from https://github.com/usestrix/strix/releases."
}

if (-not $env:STRIX_LLM) {
  throw "Set STRIX_LLM first, for example: `$env:STRIX_LLM = 'openai/gpt-5.4'"
}

$targets = @(
  "backend\src",
  "backend\__tests__",
  "frontend\app",
  "frontend\components",
  "frontend\context",
  "frontend\lib",
  "database",
  "docs"
)

$args = @("-n")
foreach ($target in $targets) {
  $args += @("-t", $target)
}

$args += @("-m", $ScanMode, "--max-budget", "$MaxBudget")

$args += @("--max-turns", "$MaxTurns")

Push-Location $repoRoot
try {
  & $strix @args
}
finally {
  Pop-Location
}
