const fs = require('fs');
const path = require('path');
const parser = require('../client/node_modules/@babel/parser');
const traverse = require('../client/node_modules/@babel/traverse').default;

const srcDir = path.join(__dirname, '..', 'client', 'src');

function getFiles(dir, extList) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, extList));
    } else {
      if (extList.some(ext => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

// Built-in JS globals, DOM globals, React globals to ignore
const KNOWN_GLOBALS = new Set([
  'window', 'document', 'navigator', 'localStorage', 'sessionStorage',
  'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'fetch', 'URL', 'URLSearchParams', 'FormData', 'Blob', 'File', 'FileReader',
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON',
  'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Error', 'TypeError',
  'RangeError', 'ReferenceError', 'SyntaxError', 'encodeURIComponent',
  'decodeURIComponent', 'encodeURI', 'decodeURI', 'parseInt', 'parseFloat',
  'isNaN', 'isFinite', 'undefined', 'NaN', 'Infinity', 'alert', 'confirm',
  'prompt', 'location', 'history', 'Intl', 'React', 'process', 'module',
  'require', 'exports', 'globalThis', 'CustomEvent', 'Event', 'btoa', 'atob',
  'performance', 'crypto', 'requestAnimationFrame', 'cancelAnimationFrame',
  'IntersectionObserver', 'ResizeObserver', 'MutationObserver'
]);

const files = getFiles(srcDir, ['.jsx', '.js']);
console.log(`Starting deep AST audit on ${files.length} files...`);

let totalIssues = 0;

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file);

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (err) {
    console.error(`[PARSE ERROR] ${relPath}: ${err.message}`);
    totalIssues++;
    continue;
  }

  traverse(ast, {
    Program(path) {
      const globals = path.scope.globals;
      for (const name in globals) {
        if (!KNOWN_GLOBALS.has(name)) {
          // Check where it's used
          const refs = globals[name];
          console.warn(`[UNDEFINED GLOBAL] In ${relPath}: "${name}" is referenced but not imported or declared!`);
          totalIssues++;
        }
      }
    }
  });
}

console.log(`\nAST Audit completed with ${totalIssues} issue(s) detected.`);
