const path = require('path');
const fs = require('fs');
const { TSDocParser } = require('@microsoft/tsdoc');

const projectRoot = path.resolve(__dirname, '..');
const docsTechnicalDir = path.join(projectRoot, 'docs', 'technical');
const scanRoots = ['packages', 'apps', 'flows'].map((d) => path.join(projectRoot, d));

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.next', '.turbo', 'coverage']);
const tsdocParser = new TSDocParser();

function findTypeScriptFiles(dirPath) {
  const tsFiles = [];
  if (!fs.existsSync(dirPath)) return tsFiles;

  const stack = [dirPath];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        stack.push(full);
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.d.ts')) continue;
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          tsFiles.push(full);
        }
      }
    }
  }
  return tsFiles;
}

function renderDocNode(node, depth = 0) {
  if (!node) return '';
  let out = '';
  const kind = node.kind;

  switch (kind) {
    case 'PlainText':
      out += node.text || '';
      break;
    case 'CodeSpan':
      out += '`' + (node.code || '') + '`';
      break;
    case 'SoftBreak':
      out += '\n';
      break;
    case 'Paragraph': {
      let inner = '';
      for (const child of node.getChildNodes()) {
        inner += renderDocNode(child, depth);
      }
      const trimmed = inner.trim();
      if (trimmed) out += trimmed + '\n\n';
      break;
    }
    case 'FencedCode':
    case 'FencedCodeBlock': {
      const lang = node.language || '';
      const code = node.code || '';
      out += '```' + lang + '\n' + code + '\n```\n\n';
      break;
    }
    case 'LinkTag': {
      const text = node.linkText || (node.urlSource && node.urlSource.text) || '';
      const url = node.urlDestination || '';
      if (url) out += '[' + text + '](' + url + ')';
      else out += text;
      break;
    }
    case 'BlockTag': {
      out += '**' + (node.tagName || '') + '**';
      break;
    }
    default:
      for (const child of node.getChildNodes()) {
        out += renderDocNode(child, depth);
      }
  }
  return out;
}

function generateForFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  const match = content.match(/\/\*\*[\s\S]*?\*\//);
  if (!match) return null;

  const result = tsdocParser.parseString(match[0]);
  if (!result.docComment) return null;

  const markdown = renderDocNode(result.docComment).trim();
  if (!markdown) return null;

  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  const outputPath = path.join(
    docsTechnicalDir,
    relativePath.replace(/\.(tsx?)$/, '.md')
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    '# ' + relativePath + '\n\n' + markdown + '\n',
    'utf8'
  );
  return outputPath;
}

function main() {
  console.log('[tsdoc] Generating TSDoc markdown documentation...');
  fs.mkdirSync(docsTechnicalDir, { recursive: true });

  const files = [];
  for (const root of scanRoots) {
    files.push(...findTypeScriptFiles(root));
  }

  let generated = 0;
  for (const file of files) {
    const out = generateForFile(file);
    if (out) generated += 1;
  }
  console.log('[tsdoc] Scanned ' + files.length + ' files, generated ' + generated + ' docs.');
}

main();
