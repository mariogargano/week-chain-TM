import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, resolve } from 'path';

const ROOT = resolve('app');
const SKIP_FILE = resolve('app/_root-layout-client.tsx');

function getAllTsxFiles(dir) {
  const results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...getAllTsxFiles(full));
    } else if (full.endsWith('.tsx') && full !== SKIP_FILE) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllTsxFiles(ROOT);
let totalFixed = 0;

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf-8');
  let changed = false;
  const original = content;

  // Remove Navbar imports
  content = content.replace(/^import\s+(?:\{[^}]*\bNavbar\b[^}]*\}|Navbar)\s+from\s+["'][^"']*navbar["'].*\n?/gm, '');

  // Remove <Navbar ... /> self-closing JSX 
  content = content.replace(/[ \t]*<Navbar\b[^>]*\/>\s*\n?/g, '');

  // Remove SiteFooter imports
  content = content.replace(/^import\s+\{[^}]*\bSiteFooter\b[^}]*\}\s+from\s+["'][^"']*site-footer["'].*\n?/gm, '');

  // Remove <SiteFooter ... /> JSX
  content = content.replace(/[ \t]*<SiteFooter\b[^>]*\/>\s*\n?/g, '');

  // Clean up excessive blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${relative(ROOT, filePath)}`);
    totalFixed++;
  }
}

console.log(`\nDone! Fixed ${totalFixed} files.`);
