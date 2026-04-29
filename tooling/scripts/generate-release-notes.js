const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const changelogPath = path.join(projectRoot, 'CHANGELOG.md');

const INITIAL_CONTENT = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

_Placeholder. Release notes generation will be implemented in a future iteration._
`;

function main() {
  console.log('[release-notes] Generating release notes...');

  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, INITIAL_CONTENT, 'utf8');
    console.log('[release-notes] Created initial CHANGELOG.md.');
  } else {
    console.log('[release-notes] CHANGELOG.md already exists, skipping initial creation.');
  }

  console.log('[release-notes] Release notes generation skipped (placeholder).');
}

main();
