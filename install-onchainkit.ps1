# Install OnchainKit and dependencies with legacy peer deps
Write-Host "Installing OnchainKit and dependencies..." -ForegroundColor Green

# Install the packages
npm install @coinbase/onchainkit wagmi viem @tanstack/react-query --save --legacy-peer-deps --force

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Yellow
