import { readdirSync } from 'fs';
import { resolve } from 'path';

console.log('CWD:', process.cwd());
console.log('Contents:', readdirSync('.'));
console.log('Resolve app:', resolve('app'));
try {
  console.log('/app contents:', readdirSync('/app'));
} catch(e) {
  console.log('/app error:', e.message);
}
try {
  console.log('./app contents:', readdirSync('./app').slice(0, 10));
} catch(e) {
  console.log('./app error:', e.message);
}
