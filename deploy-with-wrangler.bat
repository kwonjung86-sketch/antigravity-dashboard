@echo off
chcp 65001 >nul

echo ==================================================
echo   Antigravity Dashboard - Cloudflare Deploy Helper
echo ==================================================
echo.
echo 이 스크립트는 Cloudflare 로그인, Pages 배포를 도와줍니다.
echo D1 DB 생성과 바인딩은 README-CLOUDFLARE.txt를 먼저 확인하세요.
echo.

where npx.cmd >nul 2>nul
if errorlevel 1 (
  echo npx.cmd를 찾을 수 없습니다. Node.js를 먼저 설치해야 합니다.
  pause
  exit /b 1
)

echo [1/2] Cloudflare 로그인 화면을 엽니다...
npx.cmd wrangler login

echo.
echo [2/2] Pages에 public 폴더와 functions API를 배포합니다...
npx.cmd wrangler pages deploy public --project-name antigravity-dashboard

echo.
echo 완료되었습니다. 위에 나온 pages.dev 주소를 확인하세요.
pause
