const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const docsFeaturesDir = path.join(projectRoot, 'docs', 'features');

/**
 * Menjalankan perintah shell dan mengembalikan output.
 * @param {string} command - Perintah shell yang akan dijalankan.
 * @returns {string} - Output dari perintah.
 */
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', cwd: projectRoot });
  } catch (error) {
    console.error(`Error executing command: ${command}\n${error.message}`);
    return '';
  }
}

/**
 * Menganalisis commit messages dan menghasilkan dokumentasi fungsional.
 */
async function generateFunctionalDocumentation() {
  console.log('Generating functional feature documentation...');

  // Pastikan direktori output ada
  fs.mkdirSync(docsFeaturesDir, { recursive: true });

  // Membaca commit history (menggunakan format yang lebih detail)
  // --grep-reflog="feat:|fix:" untuk hanya mengambil commit yang relevan
  // --pretty=format:"%H%n%s%n%b%n---END_COMMIT---" untuk memisahkan hash, subjek, dan body
  const commitLog = runCommand('git log --pretty=format:"%H\n%s\n%b\n---END_COMMIT---" --grep="^feat:|^fix:"');
  const commits = commitLog.split('---END_COMMIT---\n').filter(Boolean);

  for (const commit of commits) {
    const lines = commit.trim().split('\n');
    if (lines.length < 2) continue;

    const hash = lines[0];
    const subject = lines[1];
    const body = lines.slice(2).join('\n').trim();

    // Mengidentifikasi tipe commit (feat, fix)
    const typeMatch = subject.match(/^(feat|fix)(?:\((.*?)\))?:\s*(.*)/i);
    let commitType = 'unknown';
    let scope = '';
    let description = subject;

    if (typeMatch) {
      commitType = typeMatch[1].toLowerCase();
      scope = typeMatch[2] ? typeMatch[2].trim() : '';
      description = typeMatch[3] ? typeMatch[3].trim() : '';
    } else {
        // Fallback jika tidak sesuai Conventional Commits
        const simpleTypeMatch = subject.match(/^(feat|fix)\b/i);
        if (simpleTypeMatch) {
            commitType = simpleTypeMatch[1].toLowerCase();
            description = subject.replace(/^(feat|fix):\s*/i, '').trim();
        }
    }


    if (!description) {
        description = subject;
    }


    const featureFileName = `${commitType}-${scope ? scope + '-' : ''}${description.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md`;
    const featureFilePath = path.join(docsFeaturesDir, featureFileName);

    let markdownContent = `# ${commitType === 'feat' ? 'Fitur Baru' : 'Perbaikan Bug'}: ${description}\n\n`;
    if (scope) {
      markdownContent += `**Cakupan**: ${scope}\n\n`;
    }
    markdownContent += `**Commit**: \`${hash}\`\n\n`;

    if (body) {
      markdownContent += '## Detail\n\n';
      markdownContent += `${body}\n\n`;
    }

    // Menambahkan timestamp saat pembuatan
    markdownContent += `*Dihasilkan secara otomatis pada: ${new Date().toISOString()}*\n`;


    fs.writeFileSync(featureFilePath, markdownContent, 'utf8');
    console.log(`Generated functional documentation for commit ${hash} -> ${featureFilePath}`);
  }

  console.log('Functional feature documentation generation complete.');
}

generateFunctionalDocumentation().catch(console.error);