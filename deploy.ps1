# Quick Deployment Script for JJ Enterprises Website
# Run this script to prepare and deploy to GitHub

Write-Host "🚀 JJ Enterprises - Deployment Helper" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Check current status
Write-Host ""
Write-Host "📊 Current Git Status:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Add all files:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Create commit:" -ForegroundColor White
Write-Host "   git commit -m 'Production ready - JJ Enterprises website'" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Create repository on GitHub:" -ForegroundColor White
Write-Host "   Go to: https://github.com/new" -ForegroundColor Yellow
Write-Host "   Create a new repository (don't initialize with README)" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Add remote and push:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Deploy to Vercel:" -ForegroundColor White
Write-Host "   Go to: https://vercel.com" -ForegroundColor Yellow
Write-Host "   Import your GitHub repository" -ForegroundColor Yellow
Write-Host "   Click Deploy!" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - DEPLOY_NOW.md (quick guide)" -ForegroundColor White
Write-Host "   - GITHUB_DEPLOYMENT.md (detailed steps)" -ForegroundColor White
Write-Host ""

