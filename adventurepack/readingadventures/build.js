#!/usr/bin/env node
/* Build: splices src/science/* into src/base.html -> index.html (single self-contained file).
   Usage: node build.js */
const fs = require('fs'), path = require('path');
const dir = __dirname, sci = path.join(dir, 'src', 'science');
const read = f => fs.readFileSync(path.join(sci, f), 'utf8');
let html = fs.readFileSync(path.join(dir, 'src', 'base.html'), 'utf8');
const js = ['content-lessons.js','content-stories.js','content-bank.js','art.js','app-core.js','app-labs.js'].map(read).join('\n\n');
if(!html.includes('/*SCIENCE_CSS*/') || !html.includes('/*SCIENCE_JS*/')) throw new Error('markers missing in base.html');
html = html.replace('/*SCIENCE_CSS*/', () => read('science.css')).replace('/*SCIENCE_JS*/', () => js);
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('Built index.html (' + Math.round(html.length/1024) + ' KB)');
