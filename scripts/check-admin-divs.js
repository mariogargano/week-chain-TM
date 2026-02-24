import fs from 'fs';
import path from 'path';

// This script runs in /home/user but the project is at /vercel/share/v0-project
const projectRoot = '/vercel/share/v0-project';
const adminDir = path.join(projectRoot, 'app', 'dashboard', 'admin');

function checkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkDir(fullPath);
    } else if (entry.name === 'page.tsx') {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const openDivs = (content.match(/<div[\s>]/g) || []).length;
      const closeDivs = (content.match(/<\/div>/g) || []).length;
      if (closeDivs > openDivs) {
        const rel = path.relative(projectRoot, fullPath);
        console.log(`MISMATCH: ${rel} - open: ${openDivs}, close: ${closeDivs}, diff: ${closeDivs - openDivs}`);
        // Show last 10 lines
        const lines = content.split('\n');
        const total = lines.length;
        console.log(`  Last 8 lines (of ${total}):`);
        for (let i = Math.max(0, total - 8); i < total; i++) {
          console.log(`  ${i+1}: ${lines[i]}`);
        }
      }
    }
  }
}

try {
  checkDir(adminDir);
  console.log('Done checking all admin pages.');
} catch (e) {
  console.error('Error:', e.message);
}
