import { stripTypeScriptTypes } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const source = readFileSync(new URL('./dashboard.ts', import.meta.url), 'utf8');
const js = stripTypeScriptTypes(source).replace(/^export /gm, '');
const template = readFileSync(new URL('./template.html', import.meta.url), 'utf8');
writeFileSync(new URL('./dashboard.html', import.meta.url), template.replace('/* DASHBOARD_CODE */', () => js));
console.log('Built dashboard.html');

mkdirSync(new URL('./public/', import.meta.url), { recursive: true });
writeFileSync(new URL('./public/index.html', import.meta.url), template.replace('/* DASHBOARD_CODE */', () => js));
