const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const changelogPath = path.join(projectRoot, 'CHANGELOG.md');

/**
 * Menghasilkan release notes berdasarkan analisis commit history.
 * Ini adalah placeholder awal.
 */
async function generateReleaseNotes() {
  console.log('Generating release notes...');

  // TODO: Implementasi nyata akan melibatkan:
  // 1. Membaca commit history dari Git (misalnya, `git log --pretty=format:"%s" --since="<last-release-tag>"`).
  // 2. Menganalisis commit messages untuk mengidentifikasi jenis perubahan (feat, fix, chore, dll.).
  // 3. Memformat perubahan tersebut ke dalam struktur release notes yang koheren.
  // 4. Memperbarui CHANGELOG.md.
  // 5. Menyiapkan data untuk publikasi ke sistem eksternal.

  const placeholderContent = `# Changelog\n\n## Unreleased\n\n*   Initial placeholder for release notes.\n`;

  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, placeholderContent, 'utf8');
    console.log(`Created initial CHANGELOG.md`);
  } else {
    console.log(`CHANGELOG.md already exists, skipping initial creation.`);
  }

  console.log('Release notes generation skipped (placeholder).');
}

generateReleaseNotes().catch(console.error);
