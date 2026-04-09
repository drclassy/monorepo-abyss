import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export function parseSkillMd(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) return null;

  const frontmatterStr = frontmatterMatch[1];
  const body = frontmatterMatch[2].trim();

  const metadata = {};
  frontmatterStr.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.substring(0, colonIdx).trim();
    let value = line.substring(colonIdx + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    metadata[key] = value;
  });

  const sections = {};
  const sectionRegex = /## (.+?)\n([\s\S]*?)(?=## |\n$)/g;
  let match;
  while ((match = sectionRegex.exec(body)) !== null) {
    sections[match[1].trim()] = match[2].trim();
  }

  return {
    name: metadata.name || 'unnamed',
    description: metadata.description || '',
    version: metadata.version || '1.0.0',
    category: metadata.category || 'general',
    tags: metadata.tags || [],
    platforms: metadata.platforms || [],
    enabled: true,
    metadata,
    body,
    sections,
    whenToUse: sections['When to Use'] || '',
    procedure: sections['Procedure'] || '',
    pitfalls: sections['Pitfalls'] || '',
    verification: sections['Verification'] || ''
  };
}

export function loadAllSkills(skillsDir) {
  const skills = [];
  if (!existsSync(skillsDir)) return skills;

  const categories = readdirSync(skillsDir).filter(f => {
    const path = join(skillsDir, f);
    return statSync(path).isDirectory() && !f.startsWith('.');
  });

  for (const category of categories) {
    const catPath = join(skillsDir, category);
    const skillDirs = readdirSync(catPath).filter(f => {
      const path = join(catPath, f);
      return statSync(path).isDirectory();
    });

    for (const skillDir of skillDirs) {
      const skillPath = join(catPath, skillDir);
      const skillMdPath = join(skillPath, 'SKILL.md');
      if (existsSync(skillMdPath)) {
        try {
          const content = readFileSync(skillMdPath, 'utf-8');
          const parsed = parseSkillMd(content);
          if (parsed) {
            skills.push({
              ...parsed,
              id: `${category}/${skillDir}`,
              folder: skillPath,
              hasReferences: existsSync(join(skillPath, 'references')),
              hasTemplates: existsSync(join(skillPath, 'templates')),
              hasScripts: existsSync(join(skillPath, 'scripts'))
            });
          }
        } catch (e) {
          console.error(`Failed to load skill: ${skillPath}`, e.message);
        }
      }
    }
  }

  return skills;
}

export function getSkillContent(skillsDir, skillId) {
  const [category, name] = skillId.split('/');
  const skillPath = join(skillsDir, category, name, 'SKILL.md');
  if (!existsSync(skillPath)) return null;
  return readFileSync(skillPath, 'utf-8');
}

export function createSkill(skillsDir, skillData) {
  const category = skillData.category || 'general';
  const name = skillData.name.replace(/\s+/g, '-').toLowerCase();
  const skillPath = join(skillsDir, category, name);

  if (!existsSync(skillPath)) mkdirSync(skillPath, { recursive: true });

  const frontmatter = `---
name: ${name}
description: "${skillData.description || ''}"
version: ${skillData.version || '1.0.0'}
category: ${category}
tags: [${(skillData.tags || []).join(', ')}]
---

# ${skillData.name || name}

## When to Use
${skillData.whenToUse || skillData.description || ''}

## Procedure
${skillData.procedure || skillData.instructions || ''}

## Pitfalls
${skillData.pitfalls || 'None identified.'}

## Verification
${skillData.verification || 'Verify output accuracy against known references.'}
`;

  writeFileSync(join(skillPath, 'SKILL.md'), frontmatter);
  return { id: `${category}/${name}`, path: skillPath };
}
