import { rmSync, existsSync } from 'fs';
import { join } from 'path';

// Clear .next cache in both possible locations
const dirs = [
  join(process.cwd(), '.next'),
  '/vercel/share/v0-next-shadcn/.next',
  '/vercel/share/v0-project/.next',
];

for (const dir of dirs) {
  if (existsSync(dir)) {
    console.log(`Removing ${dir}...`);
    rmSync(dir, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  } else {
    console.log(`${dir} does not exist`);
  }
}

console.log('Cache cleared!');
