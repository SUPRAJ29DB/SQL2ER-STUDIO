# run_backend.ps1 - Run SQL2ER FastAPI Backend

Write-Host "[SQL2ER] Starting FastAPI Backend..." -ForegroundColor Cyan

$backendDir = "$PSScriptRoot\..\backend"
Set-Location -Path $backendDir

$pythonExec = "$backendDir\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonExec)) {
    if (Test-Path "C:\Anaconda\python.exe") {
        $pythonExec = "C:\Anaconda\python.exe"
    } else {
        $pythonExec = "python"
    }
}

Write-Host "[SQL2ER] Running with: $pythonExec" -ForegroundColor Green
& $pythonExec -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

