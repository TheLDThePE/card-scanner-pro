# UploadToFirebase.ps1 (Simplified - Node.js reads Excel directly)
# This PowerShell script calls the Node.js uploader

param(
    [string]$ScriptPath = "D:\evacuation-project\BYE2G"
)

try {
    Write-Host "Starting Firebase upload process..."
    
    # Change to script directory
    Set-Location $ScriptPath
    
    # Check if Node.js is installed
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        Write-Host "ERROR: Node.js is not installed or not in PATH"
        Write-Host "Please install Node.js from https://nodejs.org/"
        exit 1
    }
    
    Write-Host "Node.js version: $nodeVersion"
    
    # Check if node_modules exists, if not run npm install
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to install dependencies"
            exit 1
        }
    }
    
    # Run the Node.js script (it will read Excel directly)
    Write-Host "Uploading to Firebase..."
    node UploadToFirebase.js
    
    exit $LASTEXITCODE
    
} catch {
    Write-Host "ERROR: $_"
    exit 1
}
