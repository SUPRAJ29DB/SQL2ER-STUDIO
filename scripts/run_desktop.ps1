# run_desktop.ps1 - Launch Electron Desktop App with Backend

Write-Host "[SQL2ER] Starting SQL2ER Desktop Application..." -ForegroundColor Cyan

$desktopDir = "$PSScriptRoot\..\desktop"
Set-Location -Path $desktopDir

if (Get-Command npm.cmd -ErrorAction SilentlyContinue) {
    npm.cmd run start
} else {
    npm run start
}

