const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--> Building ASPIDA Frontend...');
const frontendDir = path.join(__dirname, 'ASPIDA', 'frontend');

execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

const srcDist = path.join(frontendDir, 'dist');
const rootDist = path.join(__dirname, 'dist');

console.log(`--> Syncing build artifacts from ${srcDist} to ${rootDist}...`);
fs.rmSync(rootDist, { recursive: true, force: true });
fs.cpSync(srcDist, rootDist, { recursive: true });

console.log('--> Build completed successfully!');
