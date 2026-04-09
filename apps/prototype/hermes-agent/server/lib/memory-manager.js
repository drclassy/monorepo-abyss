import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const MEMORY_CHAR_LIMIT = 2200;
const USER_CHAR_LIMIT = 1375;

export function loadMemory(memoriesDir) {
  const memoryPath = join(memoriesDir, 'MEMORY.md');
  const userPath = join(memoriesDir, 'USER.md');

  let memory = '';
  let user = '';

  try { memory = readFileSync(memoryPath, 'utf-8'); } catch (e) {}
  try { user = readFileSync(userPath, 'utf-8'); } catch (e) {}

  return {
    memory: { content: memory, chars: memory.length, limit: MEMORY_CHAR_LIMIT, usage: Math.round(memory.length / MEMORY_CHAR_LIMIT * 100) },
    user: { content: user, chars: user.length, limit: USER_CHAR_LIMIT, usage: Math.round(user.length / USER_CHAR_LIMIT * 100) }
  };
}

export function addToMemory(memoriesDir, text, type = 'memory') {
  const file = type === 'user' ? 'USER.md' : 'MEMORY.md';
  const limit = type === 'user' ? USER_CHAR_LIMIT : MEMORY_CHAR_LIMIT;
  const path = join(memoriesDir, file);

  let current = '';
  try { current = readFileSync(path, 'utf-8'); } catch (e) {}

  if ((current.length + text.length + 2) > limit) {
    return { success: false, error: `Memory limit exceeded. Current: ${current.length}/${limit} chars. Please consolidate.` };
  }

  if (current.includes(text)) {
    return { success: false, error: 'Entry already exists.' };
  }

  const newContent = current ? current + '\n\n§ ' + text : '§ ' + text;
  writeFileSync(path, newContent);
  return { success: true, chars: newContent.length, limit };
}

export function replaceInMemory(memoriesDir, oldText, newText, type = 'memory') {
  const file = type === 'user' ? 'USER.md' : 'MEMORY.md';
  const path = join(memoriesDir, file);

  let current = '';
  try { current = readFileSync(path, 'utf-8'); } catch (e) {
    return { success: false, error: 'Memory file not found.' };
  }

  const count = (current.match(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count !== 1) {
    return { success: false, error: `Found ${count} matches for old_text. Must match exactly 1 entry.` };
  }

  const newContent = current.replace(oldText, newText);
  writeFileSync(path, newContent);
  return { success: true };
}

export function removeFromMemory(memoriesDir, text, type = 'memory') {
  const file = type === 'user' ? 'USER.md' : 'MEMORY.md';
  const path = join(memoriesDir, file);

  let current = '';
  try { current = readFileSync(path, 'utf-8'); } catch (e) {
    return { success: false, error: 'Memory file not found.' };
  }

  const count = (current.match(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count !== 1) {
    return { success: false, error: `Found ${count} matches. Must match exactly 1 entry.` };
  }

  const newContent = current.replace(text, '').replace(/\n{3,}/g, '\n\n').trim();
  writeFileSync(path, newContent);
  return { success: true };
}

export function scanMemoryForInjection(text) {
  const patterns = [
    /system\s*:/i,
    /ignore\s+previous/i,
    /you\s+are\s+now/i,
    /new\s+instructions/i,
    /drop\s+all/i,
    /<script/i,
    /javascript\s*:/i,
    /data\s*:/i,
    /\x00|\u200b|\u200c|\u200d|\ufeff/g
  ];
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return { safe: false, reason: `Potential injection pattern detected: ${pattern.source}` };
    }
  }
  return { safe: true };
}
