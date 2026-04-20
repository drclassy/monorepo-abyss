const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const { TSDocParser, TSDocTokenType, DocNodeKind, StandardTags } = require('@microsoft/tsdoc');

const tsdocParser = new TSDocParser();

const projectRoot = path.resolve(__dirname, '..');
const docsTechnicalDir = path.join(projectRoot, 'docs', 'technical');
const packagesDir = path.join(projectRoot, 'packages');
const appsDir = path.join(projectRoot, 'apps');
const flowsDir = path.join(projectRoot, 'flows');

/**
 * Memindai file TypeScript di direktori tertentu.
 * @param {string} dirPath - Jalur direktori yang akan dipindai.
 * @returns {string[]} - Array jalur file TypeScript.
 */
function findTypeScriptFiles(dirPath) {
  let tsFiles = [];
  if (!fs.existsSync(dirPath)) {
    return tsFiles;
  }
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Mengecualikan direktori node_modules
      if (path.basename(filePath) === 'node_modules') {
        continue;
      }
      tsFiles = tsFiles.concat(findTypeScriptFiles(filePath));
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
      tsFiles.push(filePath);
    }
  }
  return tsFiles;
}

/**
 * Helper untuk merender DocNodes menjadi string Markdown.
 * @param {import('@microsoft/tsdoc').DocNode | undefined} docNode - Node TSDoc.
 * @param {number} indentLevel - Tingkat indentasi.
 * @returns {string} - String Markdown.
 */
function renderDocNodes(docNode, indentLevel = 0) {
  if (!docNode) return '';
  let markdown = '';
  const indent = '  '.repeat(indentLevel);

  for (const child of docNode.getChildNodes()) {
    switch (child.kind) {
      case DocNodeKind.CodeSpan:
        markdown += `\`${child.code}\``;
        break;
      case DocNodeKind.PlainText:
        markdown += child.text;
        break;
      case DocNodeKind.Paragraph:
        markdown += `${indent}`;
        markdown += renderDocNodes(child, indentLevel);
        markdown += '\n\n';
        break;
      case DocNodeKind.FencedCodeBlock:
        markdown += `${indent}\`\`\`${child.language}\n${child.code}\n${indent}\`\`\`\n\n`;
        break;
      case DocNodeKind.SoftBreak:
        markdown += '\n';
        break;
      case DocNodeKind.LinkTag:
        markdown += `[${child.linkText || child.urlDestination}](${child.urlDestination})`;
        break;
      // Handle other inline elements or fall through to render children
      default:
        markdown += renderDocNodes(child, indentLevel);
        break;
    }
  }
  return markdown;
}


/**
 * Menghasilkan dokumentasi Markdown untuk file TypeScript.
 * @param {string} filePath - Jalur ke file TypeScript.\n */
function generateDocumentationForFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const tsdocResult = tsdocParser.parseString(fileContent);

  if (tsdocResult.docComment !== undefined) {
    let fileMarkdown = '';
    const relativePath = path.relative(projectRoot, filePath);
    const outputFileName = path.basename(filePath).replace(/\.ts(x)?$/, '.md');
      const outputFilePath = path.join(docsTechnicalDir, relativePath.replace(/\.ts(x)?$/, '.md'));

    fileMarkdown += `# Dokumentasi Teknis: ${relativePath}\n\n`;

    // Ringkasan Utama
    if (tsdocResult.docComment.summarySection) {
      fileMarkdown += '## Ringkasan\n\n';
      fileMarkdown += renderDocNodes(tsdocResult.docComment.summarySection);
    }

    // Parameter
    const paramBlocks = tsdocResult.docComment.customBlocks.filter(
      (block) => block.blockTag.tagName === StandardTags.param.tagName
    );
    if (paramBlocks.length > 0) {
      fileMarkdown += '## Parameter\n\n';
      fileMarkdown += '| Nama | Tipe | Deskripsi |\n';
      fileMarkdown += '|---|---|---|\n';
      for (const paramBlock of paramBlocks) {
        // TSDocParser tidak secara otomatis mengekstrak tipe dari @param {type}
        // Kita perlu mengekstraknya secara manual atau menggunakan TypeScript compiler API
        // Untuk saat ini, kita hanya akan mengambil teks penuh
        const paramContent = renderDocNodes(paramBlock.content).trim();
        const paramMatch = paramContent.match(/^{(.*?)}\s*(\w+)\s*([\s\S]*)/);
        let paramType = 'any';
        let paramName = 'unknown';
        let paramDescription = paramContent;

        if (paramMatch) {
          paramType = paramMatch[1].trim() || 'any';
          paramName = paramMatch[2].trim() || 'unknown';
          paramDescription = paramMatch[3].trim();
        } else {
          // Fallback jika regex tidak cocok, coba deteksi nama parameter dari teks
          const simpleParamMatch = paramContent.match(/^(\w+)\s*([\s\S]*)/);
          if (simpleParamMatch) {
            paramName = simpleParamMatch[1].trim();
            paramDescription = simpleParamMatch[2].trim();
          }
        }
        fileMarkdown += `| \`${paramName}\` | \`${paramType}\` | ${paramDescription} |\n`;
      }
      fileMarkdown += '\n';
    }

    // Returns
    const returnsBlock = tsdocResult.docComment.customBlocks.find(
      (block) => block.blockTag.tagName === StandardTags.returns.tagName
    );
    if (returnsBlock) {
      fileMarkdown += '## Mengembalikan (Returns)\n\n';
      // TSDocParser tidak secara otomatis mengekstrak tipe dari @returns {type}
      const returnsContent = renderDocNodes(returnsBlock.content).trim();
      const returnsMatch = returnsContent.match(/^{(.*?)}\s*([\s\S]*)/);
      let returnsType = 'any';
      let returnsDescription = returnsContent;

      if (returnsMatch) {
        returnsType = returnsMatch[1].trim() || 'any';
        returnsDescription = returnsMatch[2].trim();
      } else {
        // Fallback jika regex tidak cocok
        returnsDescription = returnsContent;
      }
      fileMarkdown += `*   **Tipe**: \`${returnsType}\`\n`;
      fileMarkdown += `*   **Deskripsi**: ${returnsDescription}\n\n`;
    }

    // Examples
    const exampleBlocks = tsdocResult.docComment.customBlocks.filter(
      (block) => block.blockTag.tagName === StandardTags.example.tagName
    );
    if (exampleBlocks.length > 0) {
      fileMarkdown += '## Contoh Penggunaan (Examples)\n\n';
      for (const exampleBlock of exampleBlocks) {
        fileMarkdown += renderDocNodes(exampleBlock.content);
        fileMarkdown += '\n';
      }
    }

    // Remarks
    if (tsdocResult.docComment.remarksBlock) {
      fileMarkdown += '## Catatan (Remarks)\n\n';
      fileMarkdown += renderDocNodes(tsdocResult.docComment.remarksBlock.content);
    }

    // Throws
    const throwsBlocks = tsdocResult.docComment.customBlocks.filter(
      (block) => block.blockTag.tagName === StandardTags.throws.tagName
    );
    if (throwsBlocks.length > 0) {
      fileMarkdown += '## Lemparan (Throws)\n\n';
      for (const throwsBlock of throwsBlocks) {
        fileMarkdown += `*   ${renderDocNodes(throwsBlock.content).trim()}\n`;
      }
      fileMarkdown += '\n';
    }

    // Custom Tags (seperti @version, @alpha, @internal, dll.)
    const customBlocks = tsdocResult.docComment.customBlocks.filter(
        (block) =>
            ![
                StandardTags.param.tagName,
                StandardTags.returns.tagName,
                StandardTags.example.tagName,
                StandardTags.throws.tagName
            ].includes(block.blockTag.tagName)
    );

    if (customBlocks.length > 0) {
        fileMarkdown += '## Informasi Tambahan\n\n';
        for (const block of customBlocks) {
            fileMarkdown += `*   **${block.blockTag.tagName}**: ${renderDocNodes(block.content).trim()}\n`;
        }
        fileMarkdown += '\n';
    }


    if (fileMarkdown.trim().length > 0) {
      // Pastikan direktori output ada
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
      fs.writeFileSync(outputFilePath, fileMarkdown, 'utf8');
      console.log(`Generated documentation for ${filePath} -> ${outputFilePath}`);
    }
  }

  if (tsdocResult.logMessages && Array.isArray(tsdocResult.logMessages)) {
    for (const message of tsdocResult.logMessages) {
      console.warn(`TSDoc Warning: ${message.text} (${filePath}:${message.textRange.pos})`);
    }
  }
}

async function main() {
  console.log('Generating TSDoc Markdown documentation...');

  const tsFiles = [];
  tsFiles.push(...findTypeScriptFiles(packagesDir));
  tsFiles.push(...findTypeScriptFiles(appsDir));
  tsFiles.push(...findTypeScriptFiles(flowsDir));

  for (const file of tsFiles) {
    generateDocumentationForFile(file);
  }

  console.log('TSDoc Markdown documentation generation complete.');
}

main().catch(console.error);
