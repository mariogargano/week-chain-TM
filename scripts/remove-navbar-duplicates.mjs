import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = '/app';
const SKIP_FILE = '/app/_root-layout-client.tsx'; // This is the one that SHOULD have Navbar

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

  // Remove Navbar imports (both named and default)
  const navbarImportRegex = /^import\s+(?:\{[^}]*\bNavbar\b[^}]*\}|Navbar)\s+from\s+["'][^"']*navbar["'].*$/gm;
  if (navbarImportRegex.test(content)) {
    content = content.replace(navbarImportRegex, '');
    changed = true;
  }

  // Remove <Navbar ... /> JSX (self-closing and with props)
  const navbarJsxRegex = /\s*<Navbar\b[^>]*\/>\s*/g;
  if (navbarJsxRegex.test(content)) {
    content = content.replace(navbarJsxRegex, '\n');
    changed = true;
  }

  // Remove SiteFooter imports
  const footerImportRegex = /^import\s+\{[^}]*\bSiteFooter\b[^}]*\}\s+from\s+["'][^"']*site-footer["'].*$/gm;
  if (footerImportRegex.test(content)) {
    content = content.replace(footerImportRegex, '');
    changed = true;
  }

  // Remove <SiteFooter ... /> JSX
  const footerJsxRegex = /\s*<SiteFooter\b[^>]*\/>\s*/g;
  if (footerJsxRegex.test(content)) {
    content = content.replace(footerJsxRegex, '\n');
    changed = true;
  }

  // Also remove lines that are just "// Import Navbar component" or "// Declare the Navbar variable"
  const navbarCommentRegex = /^\s*\/\/\s*(?:Import Navbar component|Declare the Navbar variable|Declaring Navbar variable).*$/gm;
  if (navbarCommentRegex.test(content)) {
    content = content.replace(navbarCommentRegex, '');
    changed = true;
  }

  // Clean up excessive blank lines (3+ in a row -> 2)
  content = content.replace(/\n{3,}/g, '\n\n');

  if (changed) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${relative('/app', filePath)}`);
    totalFixed++;
  }
}

console.log(`\nDone! Fixed ${totalFixed} files.`);
