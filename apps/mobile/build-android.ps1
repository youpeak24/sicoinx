<#
  One-command Android build for Windows (local Gradle).

  Run from apps\mobile in PowerShell:
      .\build-android.ps1                    # debug APK (arm64, fastest)
      .\build-android.ps1 assembleRelease    # any Gradle task / arguments
      .\build-android.ps1 -Check             # only verify Java + Android SDK, do not build

  Why this exists: a terminal only reads environment variables when it is opened, so a window that was
  open before JAVA_HOME was saved still reports "JAVA_HOME is not set". This script sets them for itself.
  It also runs the correct .\gradlew.bat (note the backslash; ".gradlew" is not a command).

  Prerequisite: the android\ folder exists. Create it with:   npx expo prebuild --platform android
#>
param(
  [switch]$Check,
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$GradleArgs
)

$ErrorActionPreference = 'Stop'

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

# --- Java: saved JAVA_HOME, else newest JDK 17 under Program Files ---------------------------------
$jdk = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
if (-not $jdk -or -not (Test-Path "$jdk\bin\java.exe")) {
  $jdk = Get-ChildItem 'C:\Program Files\Microsoft', 'C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Java' -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^jdk-?17' } | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $jdk -or -not (Test-Path "$jdk\bin\java.exe")) { Fail 'JDK 17 not found. Install it with:  winget install Microsoft.OpenJDK.17' }

# --- Android SDK -----------------------------------------------------------------------------------
$sdk = [Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')
if (-not $sdk -or -not (Test-Path $sdk)) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not (Test-Path "$sdk\platforms")) { Fail "Android SDK not found at $sdk (no platforms folder)." }

$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = $sdk
$env:Path = "$jdk\bin;$sdk\platform-tools;$env:Path"

Write-Host "JAVA_HOME    = $env:JAVA_HOME"
Write-Host "ANDROID_HOME = $env:ANDROID_HOME"
# java prints its version on stderr; PowerShell 5.1 would turn that into a terminating error, so go through cmd.
$javaLine = (cmd /c "`"$jdk\bin\java.exe`" -version 2>&1" | Select-Object -First 1)
Write-Host "java         = $javaLine"

if ($Check) { Write-Host 'Environment looks good.' -ForegroundColor Green; exit 0 }

# --- Gradle ----------------------------------------------------------------------------------------
$androidDir = Join-Path $PSScriptRoot 'android'
if (-not (Test-Path (Join-Path $androidDir 'gradlew.bat'))) {
  Fail "No android\gradlew.bat. Generate the project first:  npx expo prebuild --platform android"
}

if (-not $GradleArgs -or $GradleArgs.Count -eq 0) { $GradleArgs = @('assembleDebug') }
if (-not ($GradleArgs -match 'reactNativeArchitectures')) { $GradleArgs += '-PreactNativeArchitectures=arm64-v8a' }

Push-Location $androidDir
try {
  Write-Host "`nRunning: .\gradlew.bat $($GradleArgs -join ' ')`n"
  & .\gradlew.bat @GradleArgs
  exit $LASTEXITCODE
}
finally { Pop-Location }
