import fs from 'fs';
import { spawn } from 'child_process';

const manifestPath = '.next/prerender-manifest.json';

if (!fs.existsSync(manifestPath)) {
  console.log('\n[HECA] No production build manifest found in .next/.');
  console.log('[HECA] Automatically running "npm run build" before starting server...\n');

  const buildProcess = spawn('npx', ['next', 'build'], { stdio: 'inherit', shell: true });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n[HECA] Production build completed! Launching server...\n');
      spawn('npx', ['next', 'start', ...process.argv.slice(2)], { stdio: 'inherit', shell: true });
    } else {
      console.error(`\n[HECA] Build failed with exit code ${code}. Please fix build errors.`);
      process.exit(code || 1);
    }
  });
} else {
  spawn('npx', ['next', 'start', ...process.argv.slice(2)], { stdio: 'inherit', shell: true });
}
