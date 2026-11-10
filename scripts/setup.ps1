# setup.ps1 - Environment setup script for SQL2ER Studio

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      SQL2ER STUDIO - Setup Script        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Detect Python
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Test-Path "C:\Anaconda\python.exe") {
    $pythonCmd = "C:\Anaconda\python.exe"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}

if (-not $pythonCmd) {
    Write-Host "[ERROR] Python was not found on your system. Please install Python 3.10+." -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Using Python: $pythonCmd" -ForegroundColor Green

# 2. Setup Backend Virtual Environment
Write-Host "`n[INFO] Setting up Backend Virtual Environment..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\backend"

if (-not (Test-Path ".venv")) {
    & $pythonCmd -m venv .venv
    Write-Host "[INFO] Created virtual environment in backend/.venv" -ForegroundColor Green
} else {
    Write-Host "[INFO] Virtual environment already exists." -ForegroundColor Green
}

$venvPython = "$PSScriptRoot\..\backend\.venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    Write-Host "[INFO] Installing backend dependencies..." -ForegroundColor Yellow
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r requirements.txt
    Write-Host "[SUCCESS] Backend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "[WARNING] Using fallback python to install dependencies..." -ForegroundColor Yellow
    & $pythonCmd -m pip install -r requirements.txt
}

# 3. Setup Frontend Dependencies
Write-Host "`n[INFO] Setting up Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\frontend"

if (Get-Command npm.cmd -ErrorAction SilentlyContinue) {
    npm.cmd install
} else {
    npm install
}

# 4. Setup Desktop Dependencies
Write-Host "`n[INFO] Setting up Desktop Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\desktop"
if (Get-Command npm.cmd -ErrorAction SilentlyContinue) {
    npm.cmd install
} else {
    npm install
}

Set-Location -Path "$PSScriptRoot\.."
Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "   SQL2ER STUDIO Setup Complete! 🎉       " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Run .\scripts\run_backend.ps1 to start the API backend"
Write-Host "Run .\scripts\run_desktop.ps1 to launch Electron app"

