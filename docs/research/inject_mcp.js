const fs = require('fs');
const path = require('path');
const settingsPath = path.join(process.env.APPDATA, 'Cursor', 'User', 'settings.json');
const backupPath = settingsPath + '.bak';

console.log('--- Cursor MCP Injector (Shodh Memory) ---');

try {
    if (!fs.existsSync(settingsPath)) {
        throw new Error('settings.json not found at: ' + settingsPath);
    }

    const originalContent = fs.readFileSync(settingsPath, 'utf8');
    
    // 1. Buat Backup
    fs.writeFileSync(backupPath, originalContent, 'utf8');
    console.log('[1/3] Backup created: settings.json.bak');

    // 2. Cek apakah sudah ada ShodhMemory
    if (originalContent.includes('ShodhMemory')) {
        console.log('[!] ShodhMemory configuration already exists. Skipping...');
        process.exit(0);
    }

    // 3. Inject Config
    let newContent = originalContent.trim();
    if (newContent.endsWith('}')) {
        newContent = newContent.substring(0, newContent.lastIndexOf('}'));
    }
    newContent = newContent.trim();
    if (newContent.endsWith(',')) {
        newContent = newContent.substring(0, newContent.lastIndexOf(','));
    }

    const mcpConfig = `,\n  "cursor.mcp.servers": {\n    "ShodhMemory": {\n      "type": "command",\n      "command": "npx -y @shodh/memory-mcp"\n    }\n  }\n}`;
    
    fs.writeFileSync(settingsPath, newContent + mcpConfig, 'utf8');
    console.log('[2/3] Injection successful!');
    console.log('[3/3] DONE! Please RESTART Cursor to apply changes.');

} catch (err) {
    console.error('ERROR: ' + err.message);
    process.exit(1);
}
