import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();
const adminDir = join(cwd, 'app', 'dashboard', 'admin');

const dirs = readdirSync(adminDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const issues = [];

for (const dir of dirs) {
  const filePath = join(adminDir, dir, 'page.tsx');
  try {
    const content = readFileSync(filePath, 'utf-8');
    const openDivs = (content.match(/<div[\s>]/g) || []).length;
    const closeDivs = (content.match(/<\/div>/g) || []).length;
    
    if (closeDivs > openDivs) {
      issues.push({ file: `admin/${dir}/page.tsx`, openDivs, closeDivs, diff: closeDivs - openDivs });
    }
  } catch (e) {
    // file doesn't exist
  }
}

if (issues.length === 0) {
  console.log('No div mismatch issues found!');
} else {
  console.log(`Found ${issues.length} files with extra closing </div>:`);
  issues.forEach(i => {
    console.log(`  ${i.file}: ${i.openDivs} opens, ${i.closeDivs} closes (${i.diff} extra)`);
  });
}
