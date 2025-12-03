# Firebase Hosting Deployment Script
# Card Scanner PWA - Quick Deploy

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Card Scanner PWA - Firebase Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "[1/4] Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "✓ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
    Write-Host "✓ Firebase CLI installed" -ForegroundColor Green
}

Write-Host ""

# Build the project
Write-Host "[2/4] Building project..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\frontend"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Go back to root
Set-Location -Path $PSScriptRoot

# Deploy to Firebase
Write-Host "[3/4] Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "✗ Deployment failed!" -ForegroundColor Red
    Write-Host "Tip: Make sure you're logged in with 'firebase login'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Show URLs
Write-Host "[4/4] Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now live at:" -ForegroundColor Cyan
Write-Host "  https://ld-evacuation.web.app" -ForegroundColor White
Write-Host "  https://ld-evacuation.firebaseapp.com" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open the URL in your browser" -ForegroundColor White
Write-Host "2. Test on mobile devices" -ForegroundColor White
Write-Host "3. Add to Home Screen (PWA)" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
