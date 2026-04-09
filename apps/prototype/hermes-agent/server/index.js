import TelegramBot from "node-telegram-bot-api";
import { exec } from "child_process";
import { promisify } from "util";
import dotenv from "dotenv";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import os from "os";
import { URL } from "url";
import multer from "multer";
import crypto from "crypto";
import { extractPdfText } from "./lib/pdf-extractor.js";
import { loadAllSkills, getSkillContent } from "./lib/skill-loader.js";
import { loadMemory, addToMemory, replaceInMemory, removeFromMemory, scanMemoryForInjection } from "./lib/memory-manager.js";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
const envPath = join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const KIMI_API_KEY = process.env.VITE_KIMI_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
const KIMI_MODEL = process.env.VITE_KIMI_MODEL || process.env.VITE_HERMES_MODEL || "moonshot-v1-8k";
const AUTHORIZED_USERS = (process.env.TELEGRAM_AUTHORIZED_USERS || "").split(",").map(Number).filter(Boolean);
const PORT = process.env.HERMES_STATUS_PORT || 3999;
const projectRoot = join(__dirname, "..");

// --- System Configuration Loader ---
const serverDir = __dirname;
const paths = {
  persona: join(serverDir, "persona.md"),
  instructions: join(serverDir, "instructions.md"),
  config: join(serverDir, "agent_config.json"),
  memory: join(serverDir, "memory.json"),
  knowledgeIndex: join(serverDir, "knowledge", "index.json"),
  knowledgeFolder: join(serverDir, "knowledge"),
  skillsIndex: join(serverDir, "skills", "index.json"),
  skillsDir: join(serverDir, "skills"),
  memoriesDir: join(serverDir, "memories")
};

// Ensure memories folder exists
if (!existsSync(paths.memoriesDir)) mkdirSync(paths.memoriesDir, { recursive: true });

// --- Multer Setup for PDF Upload ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, paths.knowledgeFolder),
  filename: (req, file, cb) => {
    const id = crypto.randomBytes(6).toString('hex');
    cb(null, `${id}_${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  }
});

// --- Knowledge Base Loader ---
let knowledgeBase = { entries: [] };
try {
  knowledgeBase = JSON.parse(readFileSync(paths.knowledgeIndex, "utf-8"));
} catch (e) {
  writeFileSync(paths.knowledgeIndex, JSON.stringify(knowledgeBase, null, 2));
}

function saveKnowledgeBase() {
  writeFileSync(paths.knowledgeIndex, JSON.stringify(knowledgeBase, null, 2));
}

function searchKnowledge(query) {
  const q = query.toLowerCase();
  return knowledgeBase.entries
    .filter(e => e.enabled && e.text && e.text.toLowerCase().includes(q))
    .map(e => ({
      title: e.title,
      filename: e.filename,
      snippet: e.text.substring(e.text.toLowerCase().indexOf(q), e.text.toLowerCase().indexOf(q) + 500)
    }))
    .slice(0, 3);
}

// --- Skills Loader (Folder-based SKILL.md) ---
let installedSkills = [];
try {
  installedSkills = loadAllSkills(paths.skillsDir);
} catch (e) {
  installedSkills = [];
}

function getActiveSkillInstructions() {
  return installedSkills
    .filter(s => s.enabled)
    .map(s => `--- Skill: ${s.name} (${s.id}) ---\n${s.body}`)
    .join('\n\n');
}

function getSystemPrompt() {
  try {
    const persona = readFileSync(paths.persona, "utf-8");
    const instructions = readFileSync(paths.instructions, "utf-8");
    const skillInstructions_ = getActiveSkillInstructions();
    const base = `${persona}\n\n${instructions}`;
    return skillInstructions_ ? `${base}\n\n--- Active Skills ---\n${skillInstructions_}` : base;
  } catch (e) {
    return "Error: System files missing.";
  }
}

function getAgentConfig() {
  try {
    return JSON.parse(readFileSync(paths.config, "utf-8"));
  } catch (e) {
    return { model: "deepseek-chat", temperature: 0.3 };
  }
}

// --- Log Capturing ---
const logBuffer = [];
const originalLog = console.log;
console.log = (...args) => {
  logBuffer.push({ type: "info", msg: args.join(" "), time: new Date().toLocaleTimeString() });
  if (logBuffer.length > 100) logBuffer.shift();
  originalLog.apply(console, args);
};

// --- Chat Sessions Management ---
const sessionsPath = join(serverDir, "chat_sessions.json");
let chatSessions = {};
try {
  chatSessions = JSON.parse(readFileSync(sessionsPath, "utf-8"));
} catch (e) {
  chatSessions = {
    sessions: [],
    messages: {}
  };
  writeFileSync(sessionsPath, JSON.stringify(chatSessions, null, 2));
}

function saveChatSessions() {
  writeFileSync(sessionsPath, JSON.stringify(chatSessions, null, 2));
}

let conversations = {};
try {
  conversations = JSON.parse(readFileSync(paths.memory, "utf-8"));
} catch (e) { conversations = {}; }

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- API Server ---
const lockServer = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Method override for browser CORS workaround
  if (req.method === "POST" && url.searchParams.get("_method")) {
    req.method = url.searchParams.get("_method");
  }

  if (url.pathname === "/api/stats") {
    try {
      const me = await bot.getMe();
      const config = getAgentConfig();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ 
        bot: { name: me.first_name, username: me.username, status: "online" },
        system: { uptime: process.uptime(), memory: process.memoryUsage().rss, load: os.loadavg()[0], platform: os.platform(), model: config.model }
      }));
    } catch (err) { res.writeHead(500); res.end(); }
    return;
  }

  if (url.pathname === "/api/files") {
    try {
      const files = readdirSync(projectRoot).filter(f => !f.includes("node_modules") && !f.startsWith(".")).map(f => {
        const stats = statSync(join(projectRoot, f));
        return { name: f, size: stats.size, isDir: stats.isDirectory() };
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(files));
    } catch (err) { res.writeHead(500); res.end(); }
    return;
  }

  if (url.pathname === "/api/logs") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(logBuffer));
    return;
  }

  if (url.pathname === "/api/prompt") {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ prompt: getSystemPrompt() }));
    } else if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (data.prompt) {
            const sections = data.prompt.split("# OPERATING INSTRUCTIONS");
            const persona = sections[0].trim();
            const instructions = sections[1] ? "# OPERATING INSTRUCTIONS\n" + sections[1].trim() : "";
            
            writeFileSync(paths.persona, persona);
            if (instructions) writeFileSync(paths.instructions, instructions);
            
            console.log("Cognitive Rules synchronized to persona.md and instructions.md");
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
          }
        } catch (e) {
          console.error("❌ Failed to synchronize prompt:", e.message);
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Failed to save data" }));
        }
      });
    }
    return;
  }

  // 6. Asset File Reading (For Dashboard Inspection)
  if (url.pathname === "/api/read-file" && req.method === "GET") {
    const fileName = url.searchParams.get("name");
    const allowedFiles = ["persona.md", "instructions.md", "agent_config.json", "memory.json", ".env", "chat_sessions.json"];

    if (allowedFiles.includes(fileName)) {
      try {
        const filePath = fileName === ".env" ? join(projectRoot, ".env") : join(serverDir, fileName);
        const content = readFileSync(filePath, "utf-8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ content }));
      } catch (err) {
        res.writeHead(500); res.end(JSON.stringify({ error: "Failed to read file" }));
      }
    } else {
      res.writeHead(403); res.end(JSON.stringify({ error: "Access Denied" }));
    }
    return;
  }

  // 7. Chat Sessions API
  if (url.pathname === "/api/chat/sessions" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(chatSessions.sessions));
    return;
  }

  if (url.pathname === "/api/chat/sessions" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const sessionId = `chat_${Date.now()}`;
        const newSession = {
          id: sessionId,
          title: data.title || "New Chat",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        chatSessions.sessions.unshift(newSession);
        chatSessions.messages[sessionId] = [];
        saveChatSessions();
        console.log(`New chat session created: ${sessionId}`);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newSession));
      } catch (e) {
        console.error("❌ Failed to create session:", e.message);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Failed to create session" }));
      }
    });
    return;
  }

  if (url.pathname.startsWith("/api/chat/sessions/") && req.method === "DELETE") {
    const sessionId = url.pathname.split("/api/chat/sessions/")[1];
    if (sessionId && chatSessions.sessions.find(s => s.id === sessionId)) {
      chatSessions.sessions = chatSessions.sessions.filter(s => s.id !== sessionId);
      delete chatSessions.messages[sessionId];
      saveChatSessions();
      console.log(`Chat session deleted: ${sessionId}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Session not found" }));
    }
    return;
  }

  if (url.pathname.startsWith("/api/chat/sessions/") && req.method === "PATCH") {
    const sessionId = url.pathname.split("/api/chat/sessions/")[1];
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const session = chatSessions.sessions.find(s => s.id === sessionId);
        if (session && data.title) {
          session.title = data.title;
          session.updatedAt = new Date().toISOString();
          saveChatSessions();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(session));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Session not found" }));
        }
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Failed to update session" }));
      }
    });
    return;
  }

  if (url.pathname.startsWith("/api/chat/sessions/") && url.pathname.endsWith("/messages") && req.method === "GET") {
    const sessionId = url.pathname.split("/api/chat/sessions/")[1].replace("/messages", "");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(chatSessions.messages[sessionId] || []));
    return;
  }

  if (url.pathname.startsWith("/api/chat/sessions/") && url.pathname.endsWith("/send") && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const sessionId = url.pathname.split("/api/chat/sessions/")[1].replace("/send", "");
        const data = JSON.parse(body);
        const userMessage = { role: "user", content: data.message, timestamp: new Date().toISOString() };

        if (!chatSessions.messages[sessionId]) chatSessions.messages[sessionId] = [];
        chatSessions.messages[sessionId].push(userMessage);

        const session = chatSessions.sessions.find(s => s.id === sessionId);
        if (session && chatSessions.messages[sessionId].length === 1) {
          session.title = data.message.substring(0, 50) + (data.message.length > 50 ? "..." : "");
          session.updatedAt = new Date().toISOString();
        } else if (session) {
          session.updatedAt = new Date().toISOString();
        }

        const config = getAgentConfig();
        const systemPrompt = getSystemPrompt();
        const recentMessages = chatSessions.messages[sessionId].slice(-20);
        const lastUserMessage = [...recentMessages].reverse().find(m => m.role === 'user');
        let enhancedPrompt = systemPrompt;
        if (lastUserMessage && knowledgeBase.entries.length > 0) {
          const results = searchKnowledge(lastUserMessage.content);
          if (results.length > 0) {
            const context = results.map(r => `--- ${r.title} ---\n${r.snippet}`).join('\n\n');
            enhancedPrompt = `${systemPrompt}\n\n--- Knowledge Base Context ---\n${context}\n--- End Context ---\n\nGunakan knowledge base di atas untuk menjawab jika relevan. Jika tidak relevan, abaikan.`;
          }
        }
        const apiMessages = [
          { role: "system", content: enhancedPrompt },
          ...recentMessages.map(m => ({ role: m.role, content: m.content }))
        ];

        saveChatSessions();

        const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${KIMI_API_KEY}`
          },
          body: JSON.stringify({
            model: KIMI_MODEL,
            messages: apiMessages,
            temperature: config.temperature,
            max_tokens: config.max_tokens || 2000
          })
        });

        const result = await response.json();
        const assistantContent = result.choices?.[0]?.message?.content || "Maaf, saya tidak bisa merespons saat ini.";
        const assistantMessage = { role: "assistant", content: assistantContent, timestamp: new Date().toISOString() };

        chatSessions.messages[sessionId].push(assistantMessage);
        saveChatSessions();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          userMessage,
          assistantMessage,
          session: session || null
        }));
      } catch (e) {
        console.error("❌ Chat send error:", e.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Failed to send message", details: e.message }));
      }
    });
    return;
  }

  // 8. Knowledge Base API
  if (url.pathname === "/api/knowledge" && req.method === "GET") {
    const entries = knowledgeBase.entries.map(e => ({
      id: e.id, title: e.title, filename: e.filename,
      size: e.size, pages: e.pages, uploadedAt: e.uploadedAt, enabled: e.enabled
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(entries));
    return;
  }

  if (url.pathname === "/api/knowledge/upload" && req.method === "POST") {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
      if (!req.file) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No file uploaded" }));
        return;
      }
      try {
        const result = await extractPdfText(req.file.path);
        if (!result.success) {
          unlinkSync(req.file.path);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: result.error }));
          return;
        }
        const entry = {
          id: `kb_${Date.now()}`,
          filename: req.file.originalname,
          title: req.file.originalname.replace('.pdf', ''),
          size: req.file.size,
          pages: result.pages,
          text: result.text,
          uploadedAt: new Date().toISOString(),
          enabled: true
        };
        knowledgeBase.entries.unshift(entry);
        saveKnowledgeBase();
        console.log(`Knowledge base added: ${entry.title}`);
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, entry: { id: entry.id, title: entry.title, pages: entry.pages } }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to process PDF" }));
      }
    });
    return;
  }

  if (url.pathname.startsWith("/api/knowledge/") && req.method === "DELETE") {
    const id = url.pathname.split("/api/knowledge/")[1];
    const entry = knowledgeBase.entries.find(e => e.id === id);
    if (entry) {
      try { unlinkSync(join(paths.knowledgeFolder, entry.filename.startsWith('kb_') ? entry.filename : `${id}_${entry.filename}`)); } catch (e) {}
      knowledgeBase.entries = knowledgeBase.entries.filter(e => e.id !== id);
      saveKnowledgeBase();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    }
    return;
  }

  if (url.pathname === "/api/knowledge/search" && req.method === "GET") {
    const query = url.searchParams.get("q") || "";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(searchKnowledge(query)));
    return;
  }

  // 9. Model Switch API
  if (url.pathname === "/api/models" && req.method === "GET") {
    const availableModels = [
      { id: "moonshot-v1-8k", name: "Kimi 8K", provider: "Moonshot", context: "8K" },
      { id: "moonshot-v1-32k", name: "Kimi 32K", provider: "Moonshot", context: "32K" },
      { id: "moonshot-v1-128k", name: "Kimi 128K", provider: "Moonshot", context: "128K" },
      { id: "deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek", context: "4K" },
      { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", context: "128K" }
    ];
    const config = getAgentConfig();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ active: KIMI_MODEL || config.model, available: availableModels }));
    return;
  }

  if (url.pathname === "/api/models/switch" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (data.model) {
          const config = getAgentConfig();
          config.model = data.model;
          writeFileSync(paths.config, JSON.stringify(config, null, 2));
          process.env.VITE_KIMI_MODEL = data.model;
          console.log(`Model switched to: ${data.model}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, model: data.model }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No model specified" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  // 10. Memory Management API
  if (url.pathname === "/api/chat/memory/stats" && req.method === "GET") {
    const totalSessions = chatSessions.sessions.length;
    const totalMessages = Object.values(chatSessions.messages).reduce((sum, msgs) => sum + (Array.isArray(msgs) ? msgs.length : 0), 0);
    const kbUsed = knowledgeBase.entries.reduce((sum, e) => sum + (e.text ? e.text.length : 0), 0);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      totalSessions, totalMessages,
      knowledgeEntries: knowledgeBase.entries.length,
      knowledgeTextKB: Math.round(kbUsed / 1024)
    }));
    return;
  }

  if (url.pathname.startsWith("/api/chat/sessions/") && url.pathname.endsWith("/clear") && req.method === "POST") {
    const sessionId = url.pathname.split("/api/chat/sessions/")[1].replace("/clear", "");
    if (chatSessions.messages[sessionId]) {
      chatSessions.messages[sessionId] = [];
      saveChatSessions();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
    }
    return;
  }

  // 11. Skills API (Folder-based)
  if (url.pathname === "/api/skills" && req.method === "GET") {
    installedSkills = loadAllSkills(paths.skillsDir);
    const skillsMeta = installedSkills.map(s => ({
      id: s.id, name: s.name, description: s.description, version: s.version,
      category: s.category, tags: s.tags, enabled: s.enabled,
      whenToUse: s.whenToUse, hasReferences: s.hasReferences,
      hasTemplates: s.hasTemplates, hasScripts: s.hasScripts
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(skillsMeta));
    return;
  }

  if (url.pathname === "/api/skills/available" && req.method === "GET") {
    installedSkills = loadAllSkills(paths.skillsDir);
    const all = installedSkills.map(s => ({
      id: s.id, name: s.name, description: s.description, category: s.category,
      tags: s.tags, version: s.version, enabled: s.enabled
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(all));
    return;
  }

  if (url.pathname === "/api/skills/content" && req.method === "GET") {
    const skillId = url.searchParams.get("id");
    if (skillId) {
      const content = getSkillContent(paths.skillsDir, skillId);
      if (content) {
        res.writeHead(200, { "Content-Type": "text/markdown" });
        res.end(content);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Skill not found" }));
      }
    } else {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "id parameter required" }));
    }
    return;
  }

  if (url.pathname === "/api/skills/create" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (data.name && (data.instructions || data.procedure)) {
          const result = require('./lib/skill-loader.js').createSkill(paths.skillsDir, data);
          installedSkills = loadAllSkills(paths.skillsDir);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "name and instructions required" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  if (url.pathname === "/api/skills/toggle" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (data.id) {
          const [category, name] = data.id.split('/');
          const skillPath = join(paths.skillsDir, category, name, 'SKILL.md');
          if (existsSync(skillPath)) {
            let content = readFileSync(skillPath, 'utf-8');
            if (data.enabled === false) {
              content = content.replace(/^enabled: true/im, 'enabled: false');
            } else {
              content = content.replace(/^enabled: false/im, 'enabled: true');
            }
            writeFileSync(skillPath, content);
            installedSkills = loadAllSkills(paths.skillsDir);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Skill not found" }));
          }
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  // 12. Memory Management API (MEMORY.md + USER.md)
  if (url.pathname === "/api/memory" && req.method === "GET") {
    const mem = loadMemory(paths.memoriesDir);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(mem));
    return;
  }

  if (url.pathname === "/api/memory/add" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (!data.text) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "text required" })); return; }
        const scan = scanMemoryForInjection(data.text);
        if (!scan.safe) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: scan.reason })); return; }
        const result = addToMemory(paths.memoriesDir, data.text, data.type || 'memory');
        res.writeHead(result.success ? 200 : 400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  if (url.pathname === "/api/memory/replace" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (!data.oldText || !data.newText) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "oldText and newText required" })); return; }
        const result = replaceInMemory(paths.memoriesDir, data.oldText, data.newText, data.type || 'memory');
        res.writeHead(result.success ? 200 : 400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  if (url.pathname === "/api/memory/remove" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (!data.text) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "text required" })); return; }
        const result = removeFromMemory(paths.memoriesDir, data.text, data.type || 'memory');
        res.writeHead(result.success ? 200 : 400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
      }
    });
    return;
  }

  res.writeHead(404); res.end();
});

lockServer.listen(PORT, "127.0.0.1", () => {
  console.log(`Hermes Secure API listening on port ${PORT}`);
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/") || !AUTHORIZED_USERS.includes(msg.from.id)) return;
  const chatId = msg.chat.id;
  bot.sendChatAction(chatId, "typing");
  try {
    if (!conversations[chatId]) conversations[chatId] = [];
    conversations[chatId].push({ role: "user", content: msg.text });
    if (conversations[chatId].length > 10) conversations[chatId] = conversations[chatId].slice(-10);

    const config = getAgentConfig();
    let systemPrompt = getSystemPrompt();
    if (knowledgeBase.entries.length > 0) {
      const results = searchKnowledge(msg.text);
      if (results.length > 0) {
        const context = results.map(r => `--- ${r.title} ---\n${r.snippet}`).join('\n\n');
        systemPrompt = `${systemPrompt}\n\n--- Knowledge Base Context ---\n${context}\n--- End Context ---`;
      }
    }
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KIMI_API_KEY}` },
      body: JSON.stringify({ model: KIMI_MODEL, messages: [{ role: "system", content: systemPrompt }, ...conversations[chatId]], temperature: config.temperature }),
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "No response.";
    conversations[chatId].push({ role: "assistant", content: reply });
    writeFileSync(paths.memory, JSON.stringify(conversations, null, 2));
    const chunks = reply.match(/[\s\S]{1,4000}/g) || [];
    for (const chunk of chunks) bot.sendMessage(chatId, chunk, { parse_mode: "Markdown" });
  } catch (error) { console.error("Hermes Error:", error.message); }
});

process.on("SIGINT", () => { bot.stopPolling(); lockServer.close(); process.exit(0); });
