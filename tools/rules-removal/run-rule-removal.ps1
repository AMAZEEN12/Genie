<#
 Runs each Genie rule test with its protection removed and saves the failing output.
 Run from the REPO ROOT in PowerShell:

   git switch main; git pull
   git switch -c scratch/rule-removal
   .\tools\rule-removal\run-rule-removal.ps1                 # all 10 rules
   .\tools\rule-removal\run-rule-removal.ps1 -Only 02,05     # just some
   .\tools\rule-removal\run-rule-removal.ps1 -Only 02 -ConfirmGreen   # also re-run the test after restoring

 Needs: Docker running (Testcontainers), Java 25 on PATH / JAVA_HOME.
 It refuses to run unless you are on a branch named scratch/*, with a clean working tree.
 Every edit is restored with `git checkout -- service` after each rule. Nothing is ever committed.
 Logs and a ready-to-paste entries file go to  $env:USERPROFILE\rule-removal-logs\<timestamp>\
#>
param(
  [string[]]$Only = @(),
  [switch]$ConfirmGreen
)
$ErrorActionPreference = 'Stop'
$root = (git rev-parse --show-toplevel).Trim()
Set-Location $root

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($branch -notlike 'scratch/*') { throw "You are on '$branch'. Create a scratch branch first: git switch -c scratch/rule-removal" }
if ((git status --porcelain)) { throw "Working tree is not clean. Commit, stash or discard your changes first." }

$rules = Get-Content "$PSScriptRoot\rules.json" -Raw | ConvertFrom-Json
if ($Only.Count) { $rules = $rules | Where-Object { $id = $_.id; ($Only | Where-Object { $id.StartsWith($_) }).Count -gt 0 } }
if (-not $rules) { throw "No rule matched -Only $($Only -join ',')" }

$stamp  = Get-Date -Format 'yyyyMMdd-HHmmss'
$outDir = Join-Path $env:USERPROFILE "rule-removal-logs\$stamp"
New-Item -ItemType Directory -Force $outDir | Out-Null
$entries = Join-Path $outDir 'entries.md'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Edit-File($path, $find, $replace) {
  $full = Join-Path $root $path
  $text = [IO.File]::ReadAllText($full)
  $crlf = $text.Contains("`r`n")
  $norm = $text.Replace("`r`n", "`n")
  $i = $norm.IndexOf($find)
  if ($i -lt 0) { throw "Text to remove was not found in $path. The code has changed since this script was written:`n$find" }
  $norm = $norm.Substring(0, $i) + $replace + $norm.Substring($i + $find.Length)
  if ($crlf) { $norm = $norm.Replace("`n", "`r`n") }
  [IO.File]::WriteAllText($full, $norm, $utf8)
}

function Run-Test($test, $logPath) {
  Push-Location (Join-Path $root 'service')
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'   # Maven writes warnings to stderr; PowerShell 5.1 would treat them as errors
  try {
    # Each -D option is quoted: PowerShell otherwise splits "-Dit.test=X" at the dot.
    & .\mvnw.cmd -B clean verify "-Dit.test=$test" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false" 2>&1 |
      Tee-Object -FilePath $logPath | Out-Host
    return $LASTEXITCODE
  } finally { $ErrorActionPreference = $prev; Pop-Location }
}

$summary = @()
foreach ($r in $rules) {
  Write-Host "`n=== $($r.id): $($r.rule)  (test: $($r.test)) ===" -ForegroundColor Cyan
  $log = Join-Path $outDir "$($r.id)-FAILS.log"
  $verdict = ''
  try {
    foreach ($e in $r.edits) { Edit-File $e.file $e.find $e.replace }
    git diff --stat | Out-Host
    $changed = (git diff --name-only) -join ', '
    $code = Run-Test $r.test $log
    $text = Get-Content $log -Raw
    if ($text -match 'COMPILATION ERROR|Could not resolve|Cannot connect to the Docker|ApplicationContext failure threshold') {
      $verdict = 'INVALID (compile/setup/Docker error, not evidence)'
    } elseif ($code -eq 0) {
      $verdict = 'STILL PASSES (protection not fully removed, or the test proves nothing)'
    } elseif ($text -match 'BUILD FAILURE' -and $text -match [regex]::Escape($r.test) -and $text -match 'Tests run:.*(Failures: [1-9]|Errors: [1-9])') {
      $verdict = 'FAILS AS EXPECTED (valid evidence)'
    } else {
      $verdict = 'UNCLEAR (failed, but not clearly because of the test; read the log)'
    }
    $key = Select-String -Path $log -Pattern 'Tests run:|FAIL|Expecting|expected|but was|Status expected|AssertionFailedError' |
           Select-Object -First 20 | ForEach-Object { $_.Line }
    @"

### $($r.id): $($r.rule)
- Date / by: $(Get-Date -Format 'yyyy-MM-dd') / <your name>
- Branch (scratch, deleted after): $branch
- What was removed: $changed (see rules.json for the exact text)
- Command: ``cd service; .\mvnw.cmd -B clean verify "-Dit.test=$($r.test)" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"``
- Result: $verdict
- Output:
``````
$($key -join "`n")
``````
- Restored and re-run: <date, or run with -ConfirmGreen>
"@ | Add-Content -Path $entries -Encoding UTF8
  } finally {
    git checkout -- service
  }
  if ($ConfirmGreen) {
    Write-Host "Restored. Re-running $($r.test) to confirm it passes again..." -ForegroundColor Yellow
    $greenCode = Run-Test $r.test (Join-Path $outDir "$($r.id)-PASSES.log")
    $verdict += $(if ($greenCode -eq 0) { ' | restored: BUILD SUCCESS' } else { ' | restored run FAILED, investigate' })
  }
  $summary += [pscustomobject]@{ Rule = $r.id; Test = $r.test; Verdict = $verdict }
}

Write-Host "`n=========== SUMMARY ===========" -ForegroundColor Green
$summary | Format-Table -AutoSize -Wrap | Out-Host
Write-Host "Logs and entries: $outDir"
Write-Host "Next: paste the entries into docs/rule-removal-log.md on your docs branch, then:  git switch main; git branch -D $branch"
