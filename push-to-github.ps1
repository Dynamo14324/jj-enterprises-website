# Push to GitHub Script
# Run this after creating repository on GitHub

Write-Host "🚀 JJ Enterprises - Push to GitHub" -ForegroundColor Cyan
Write-Host ""

# Check if remote exists
$remoteExists = git remote -v 2>$null
if ($remoteExists) {
    Write-Host "✅ Remote already configured:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
} else {
    Write-Host "📝 Please provide your GitHub repository URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example: https://github.com/yourusername/jj-enterprises-website.git" -ForegroundColor Gray
    Write-Host ""
    $repoUrl = Read-Host "Enter repository URL"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "Adding remote..." -ForegroundColor Yellow
        git remote add origin $repoUrl
        
        Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
        git push -u origin main
        
        Write-Host ""
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next step: Deploy to Vercel at https://vercel.com" -ForegroundColor Cyan
    } else {
        Write-Host "❌ No URL provided. Exiting." -ForegroundColor Red
    }
}

