const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clear .next cache in both possible directories
const dirs = [
  '/vercel/share/v0-project/.next',
  '/vercel/share/v0-next-shadcn/.next',
];

for (const dir of dirs) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`Deleted: ${dir}`);
    } else {
      console.log(`Not found: ${dir}`);
    }
  } catch (e) {
    console.log(`Error deleting ${dir}: ${e.message}`);
  }
}

// Also check if the navbar file in v0-next-shadcn is the broken one
const altNavbar = '/vercel/share/v0-next-shadcn/components/navbar.tsx';
try {
  if (fs.existsSync(altNavbar)) {
    const content = fs.readFileSync(altNavbar, 'utf8');
    const line57 = content.split('\n')[56]; // 0-indexed
    console.log(`\nv0-next-shadcn navbar line 57: ${line57}`);
    
    if (content.includes('const isTransparent = isTransparent')) {
      console.log('\nFOUND THE BUG in v0-next-shadcn! Fixing...');
      const fixed = content.replace(
        'const isTransparent = isTransparent',
        'const isTransparent = isHome && !scrolled && !mobileMenuOpen'
      );
      fs.writeFileSync(altNavbar, fixed, 'utf8');
      console.log('FIXED the navbar in v0-next-shadcn!');
    }
  } else {
    console.log(`\nAlternate navbar not found at: ${altNavbar}`);
  }
} catch (e) {
  console.log(`Error checking alternate navbar: ${e.message}`);
}

// List what's in v0-next-shadcn
try {
  const entries = fs.readdirSync('/vercel/share/v0-next-shadcn');
  console.log('\nContents of /vercel/share/v0-next-shadcn:', entries.join(', '));
} catch(e) {
  console.log(`\nCannot read v0-next-shadcn: ${e.message}`);
}

console.log('\nDone!');
