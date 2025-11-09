@echo off
echo ========================================
echo   Sunnah Way Admin Panel Deployment
echo ========================================
echo.

echo Step 1: Checking Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
) else (
    echo Vercel CLI found!
)

echo.
echo Step 2: Building project...
call npm run build

echo.
echo Step 3: Deploying to Vercel...
echo.
echo IMPORTANT: Make sure you have added all environment variables in Vercel dashboard!
echo.
pause

vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your admin panel is now live!
echo Check the URL above to access it.
echo.
pause
