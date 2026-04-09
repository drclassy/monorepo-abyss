import React, { useState, useEffect, useRef } from 'react';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

const App: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prompt, setPrompt] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Chat Room State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [showChat, setShowChat] = useState(false);

  // Knowledge Base State
  const [knowledgeFiles, setKnowledgeFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Model Switch State
  const [currentModel, setCurrentModel] = useState('moonshot-v1-8k');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  // Memory Stats State
  const [memoryStats, setMemoryStats] = useState<any>(null);

  // Skills State
  const [skills, setSkills] = useState<any[]>([]);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', description: '', instructions: '', category: 'custom' });

  const fetchData = () => {
    fetch('http://localhost:3999/api/stats').then(res => res.json()).then(setStats).catch(() => {});
    fetch('http://localhost:3999/api/logs').then(res => res.json()).then(setLogs).catch(() => {});
    fetch('http://localhost:3999/api/files').then(res => res.json()).then(setFiles).catch(() => {});
  };

  useEffect(() => {
    fetch('http://localhost:3999/api/prompt').then(res => res.json()).then(d => setPrompt(d.prompt));
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      fetch(`http://localhost:3999/api/read-file?name=${selectedFile}`)
        .then(res => res.json())
        .then(data => setFileContent(data.content))
        .catch(() => setFileContent("Error reading file."));
    }
  }, [selectedFile]);

  // Chat Room Functions
  const loadChatSessions = () => {
    fetch('http://localhost:3999/api/chat/sessions')
      .then(res => res.json())
      .then(setChatSessions)
      .catch(() => {});
  };

  const loadMessages = (sessionId: string) => {
    fetch(`http://localhost:3999/api/chat/sessions/${sessionId}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(() => setMessages([]));
  };

  const createNewChat = () => {
    fetch('http://localhost:3999/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed: ' + res.status);
        return res.json();
      })
      .then(newSession => {
        setActiveChatId(newSession.id);
        setMessages([]);
        loadChatSessions();
        setTimeout(() => chatInputRef.current?.focus(), 100);
      })
      .catch(err => alert('New Chat failed: ' + err.message));
  };

  const deleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat session?')) return;
    fetch(`http://localhost:3999/api/chat/sessions/${sessionId}?_method=DELETE`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Failed: ' + res.status);
        return res.json();
      })
      .then(() => {
        loadChatSessions();
        if (activeChatId === sessionId) {
          setActiveChatId(null);
          setMessages([]);
        }
      })
      .catch(err => alert('Delete failed: ' + err.message));
  };

  const renameChat = (sessionId: string, newTitle: string) => {
    fetch(`http://localhost:3999/api/chat/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    })
      .then(res => res.json())
      .then(() => {
        loadChatSessions();
        setIsEditingTitle(null);
      })
      .catch(() => {});
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !activeChatId || isTyping) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    fetch(`http://localhost:3999/api/chat/sessions/${activeChatId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content })
    })
      .then(res => res.json())
      .then(data => {
        if (data.assistantMessage) {
          setMessages(prev => [...prev, data.assistantMessage]);
          loadChatSessions(); // Refresh titles
        }
        setIsTyping(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .catch(() => {
        setIsTyping(false);
      });
  };

  const formatMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    loadChatSessions();
  }, []);

  // Knowledge Base Functions
  const loadKnowledge = () => {
    fetch('http://localhost:3999/api/knowledge')
      .then(res => res.json())
      .then(setKnowledgeFiles)
      .catch(() => {});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://localhost:3999/api/knowledge/upload', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        setIsUploading(false);
        if (data.success) { loadKnowledge(); if (fileInputRef.current) fileInputRef.current.value = ''; }
        else alert('Upload failed: ' + data.error);
      })
      .catch(() => setIsUploading(false));
  };

  const deleteKnowledge = (id: string) => {
    if (!confirm('Delete this knowledge base?')) return;
    fetch(`http://localhost:3999/api/knowledge/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => loadKnowledge())
      .catch(() => {});
  };

  useEffect(() => {
    if (activeTab === 'knowledge') loadKnowledge();
  }, [activeTab]);

  // Model & Memory Functions
  const loadModels = () => {
    fetch('http://localhost:3999/api/models')
      .then(res => res.json())
      .then(data => { setCurrentModel(data.active); setAvailableModels(data.available); })
      .catch(() => {});
  };

  const switchModel = (modelId: string) => {
    fetch('http://localhost:3999/api/models/switch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId })
    }).then(res => res.json()).then(data => {
      if (data.success) { setCurrentModel(modelId); setShowModelDropdown(false); loadModels(); }
    });
  };

  const loadMemoryStats = () => {
    fetch('http://localhost:3999/api/chat/memory/stats')
      .then(res => res.json())
      .then(setMemoryStats)
      .catch(() => {});
  };

  const clearSession = () => {
    if (!activeChatId || !confirm('Clear all messages in this chat?')) return;
    fetch(`http://localhost:3999/api/chat/sessions/${activeChatId}/clear`, { method: 'POST' })
      .then(res => res.json())
      .then(() => { setMessages([]); loadMemoryStats(); });
  };

  useEffect(() => { loadModels(); loadMemoryStats(); }, []);

  // Skills Functions
  const loadSkills = () => {
    fetch('http://localhost:3999/api/skills')
      .then(res => res.json())
      .then(setSkills)
      .catch(() => {});
  };

  const toggleSkill = (id: string) => {
    const skill = skills.find(s => s.id === id);
    if (!skill) return;
    fetch('http://localhost:3999/api/skills/toggle', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled: !skill.enabled })
    }).then(() => loadSkills());
  };

  const installCustomSkill = () => {
    if (!newSkill.name || !newSkill.instructions) return;
    fetch('http://localhost:3999/api/skills/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newSkill, category: newSkill.category || 'custom' })
    }).then(res => res.json()).then(data => {
      if (data.id) { loadSkills(); setShowSkillForm(false); setNewSkill({ name: '', description: '', instructions: '', category: '' }); }
    });
  };

  const SidebarItem = ({ id, label, code }: { id: string, label: string, code: string }) => (
    <div 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-150 border-l-2 ${
        activeTab === id ? 'bg-white/5 border-white text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/2'
      }`}
    >
      <span className="text-[10px] font-mono opacity-50">{code}</span>
      <span className="text-xs font-semibold tracking-widest uppercase">{label}</span>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-white/10 bg-[#0A0A0C]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-neutral-500">System Integrity Probes</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2"><span className="text-[11px] text-neutral-500 uppercase">Process Uptime</span><span className="text-xs font-mono">{Math.floor((stats?.system?.uptime || 0) / 60)}M {Math.floor(stats?.system?.uptime || 0) % 60}S</span></div>
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2"><span className="text-[11px] text-neutral-500 uppercase">API Latency</span><span className="text-[11px] font-mono text-emerald-500">{stats?.system?.latency || '---'}</span></div>
                <div className="flex justify-between items-baseline border-b border-white/5 pb-2"><span className="text-[11px] text-neutral-500 uppercase">CPU Load</span><span className="text-[11px] font-mono">{stats?.system?.load?.toFixed(2) || '0.00'}</span></div>
              </div>
            </div>
            <div className="p-8 border border-white/10 bg-[#0A0A0C]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-neutral-500">Resource Monitoring</h3>
              <div className="h-1 w-full bg-neutral-900 mb-4"><div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min(100, (stats?.system?.memory || 0) / 1024 / 1024 / 2)}%` }} /></div>
              <div className="flex justify-between text-[11px]"><span className="text-neutral-500 uppercase tracking-widest">Memory RSS</span><span className="font-mono">{Math.round((stats?.system?.memory || 0) / 1024 / 1024)} MB / 512 MB</span></div>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <div className="flex flex-col h-[650px] bg-[#050505] border border-white/10 p-6">
            <div className="flex-1 font-mono text-[11px] overflow-y-auto mb-4">
              {logs.map((log, i) => (
                <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-rose-500' : 'text-neutral-400'}`}>
                  <span className="text-neutral-600 mr-4">[{log.time}]</span><span>{log.msg}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
            <div className="flex items-center gap-3 border-t border-white/10 pt-4 font-mono text-[11px]">
              <span className="text-emerald-500 font-bold tracking-widest">SHELL@SENTRA:~$</span>
              <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && command.trim()) {
                  fetch('http://localhost:3999/api/exec', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command }) });
                  setCommand('');
                }
              }} className="bg-transparent border-none outline-none flex-1 text-white" autoFocus />
            </div>
          </div>
        );
      case 'persona':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Cognitive Rules Definition</h3>
              <button onClick={() => { setIsSaving(true); fetch('http://localhost:3999/api/prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) }).then(() => setTimeout(() => setIsSaving(false), 1000)); }} disabled={isSaving} className="bg-white text-black text-[10px] font-bold px-8 py-2 uppercase tracking-[0.2em] disabled:opacity-50">
                {isSaving ? 'Synchronizing...' : 'Commit Changes'}
              </button>
            </div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-[550px] bg-[#0A0A0C] border border-white/10 p-8 text-sm text-neutral-300 focus:border-white/30 outline-none font-mono leading-relaxed resize-none" spellCheck={false} />
          </div>
        );
      case 'memory':
        return (
          <div className="flex h-[700px] gap-8 animate-fade-in">
            {/* File List */}
            <div className="w-1/3 space-y-4 overflow-y-auto">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Neural Asset Inventory</h3>
              {["persona.md", "instructions.md", "agent_config.json", "memory.json", ".env"].map(fileName => (
                <div
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`p-4 border transition-all cursor-pointer ${selectedFile === fileName ? 'border-white bg-white/5' : 'border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold tracking-widest uppercase">{fileName}</span>
                    <span className="text-[10px] font-mono text-neutral-600">MOD: SECURE</span>
                  </div>
                </div>
              ))}
            </div>
            {/* File Viewer */}
            <div className="flex-1 bg-[#0A0A0C] border border-white/10 p-10 overflow-auto">
              <header className="mb-6 flex justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Asset Stream: {selectedFile || "None Selected"}</span>
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Read-Only View</span>
              </header>
              <pre className="text-xs font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed">
                {fileContent || "Select a protocol file to audit its contents."}
              </pre>
            </div>
          </div>
        );
      case 'knowledge':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Knowledge Base — PDF Health Database</h3>
              <div>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-white text-black text-[9px] font-bold px-6 py-2 uppercase tracking-widest disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Upload PDF'}
                </button>
              </div>
            </div>
            {knowledgeFiles.length === 0 ? (
              <div className="p-12 border border-white/10 bg-[#0A0A0C] text-center text-neutral-600 text-sm">
                No knowledge base yet. Upload PDF files (jurnal medis, drug database, clinical guideline) untuk Hermes pelajari.
              </div>
            ) : (
              <div className="space-y-3">
                {knowledgeFiles.map(kf => (
                  <div key={kf.id} className="p-4 border border-white/10 bg-[#0A0A0C] flex justify-between items-center">
                    <div>
                      <div className="text-xs text-white font-medium">{kf.title}</div>
                      <div className="text-[9px] text-neutral-600 mt-1">{kf.pages} halaman • {(kf.size / 1024).toFixed(1)} KB • {new Date(kf.uploadedAt).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => deleteKnowledge(kf.id)} className="text-[9px] text-neutral-600 hover:text-white border border-white/10 px-3 py-1 uppercase tracking-widest transition-all">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'skills':
        const activeSkills = skills.filter((s: any) => s.enabled);
        const availableSkills = skills.filter((s: any) => !s.enabled);
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Skills Management</h3>
              <button onClick={() => setShowSkillForm(!showSkillForm)} className="bg-white/10 text-white text-[9px] font-bold px-6 py-2 uppercase tracking-widest rounded border border-white/10">
                {showSkillForm ? 'Cancel' : '+ Custom Skill'}
              </button>
            </div>
            {showSkillForm && (
              <div className="p-6 border border-white/10 bg-[#0A0A0C] space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <input value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} placeholder="Skill name" className="bg-[#050505] border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-white/30" />
                  <input value={newSkill.description} onChange={(e) => setNewSkill({...newSkill, description: e.target.value})} placeholder="Description" className="bg-[#050505] border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-white/30" />
                  <input value={newSkill.category} onChange={(e) => setNewSkill({...newSkill, category: e.target.value})} placeholder="Category" className="bg-[#050505] border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-white/30" />
                </div>
                <textarea value={newSkill.instructions} onChange={(e) => setNewSkill({...newSkill, instructions: e.target.value})} placeholder="Instructions (prompt template)" rows={6} className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-white/30 font-mono resize-none" />
                <button onClick={installCustomSkill} className="bg-white text-black text-[9px] font-bold px-6 py-2 uppercase tracking-widest">Create</button>
              </div>
            )}
            {/* Active Skills */}
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Active Skills ({activeSkills.length})
              </h4>
              {activeSkills.length === 0 ? (
                <div className="p-4 border border-white/5 bg-[#0A0A0C] text-center text-neutral-700 text-[10px]">No active skills. Activate skills below.</div>
              ) : (
                <div className="space-y-2">
                  {activeSkills.map((skill: any) => (
                    <div key={skill.id} className="p-3 border border-emerald-500/10 bg-[#0A0A0C] flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white font-medium">{skill.name}</span>
                          <span className="text-[8px] text-neutral-600 font-mono bg-white/5 px-2 py-0.5 rounded">{skill.category}</span>
                        </div>
                        <div className="text-[9px] text-neutral-500 mt-1 ml-0">{skill.description}</div>
                      </div>
                      <button onClick={() => toggleSkill(skill.id)} className="shrink-0 text-[8px] px-3 py-1 uppercase tracking-widest border border-emerald-500/30 text-emerald-500 hover:border-white/10 hover:text-neutral-600 transition-all">
                        Deactivate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Available Skills */}
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full"></div>
                Available ({availableSkills.length})
              </h4>
              {availableSkills.length === 0 ? (
                <div className="p-4 border border-white/5 bg-[#0A0A0C] text-center text-neutral-700 text-[10px]">All skills are active.</div>
              ) : (
                <div className="space-y-2">
                  {availableSkills.map((skill: any) => (
                    <div key={skill.id} className="p-3 border border-white/5 bg-[#08080A] flex justify-between items-start opacity-60 hover:opacity-100 transition-all">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-neutral-400 font-medium">{skill.name}</span>
                          <span className="text-[8px] text-neutral-700 font-mono bg-white/5 px-2 py-0.5 rounded">{skill.category}</span>
                          <span className="text-[8px] text-neutral-700 font-mono">v{skill.version}</span>
                        </div>
                        <div className="text-[9px] text-neutral-600 mt-1 ml-0">{skill.description}</div>
                        {skill.tags && skill.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {skill.tags.map((t: string) => <span key={t} className="text-[7px] text-neutral-700 bg-white/5 px-1.5 py-0.5 rounded">{t}</span>)}
                          </div>
                        )}
                      </div>
                      <button onClick={() => toggleSkill(skill.id)} className="shrink-0 text-[8px] px-3 py-1 uppercase tracking-widest border border-white/10 text-neutral-600 hover:text-white hover:border-white/30 transition-all">
                        Activate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#EDEDED] font-sans overflow-hidden antialiased">
      {/* Sidebar - Full Navigation */}
      <div className="w-80 bg-[#0A0A0C] border-r border-white/10 flex flex-col">
        <div className="p-10 border-b border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden shrink-0">
              <img src="/avatar.png" alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-500">H</div>'; }} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase">{stats?.bot?.name || 'Protocol.Hermes'}</h2>
              <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 ${stats?.bot?.status === 'online' ? 'bg-emerald-500' : 'bg-neutral-700'}`} /><span className="text-[9px] font-mono text-neutral-600 tracking-widest uppercase">{stats?.bot?.status || 'offline'}</span></div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-10">
          <div className="px-10 mb-6"><p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em]">Operational</p></div>
          <SidebarItem id="dashboard" label="System Overview" code="01" />
          <SidebarItem id="terminal" label="Activity Logs" code="02" />
          <div className="px-10 mt-12 mb-6"><p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em]">Configuration</p></div>
          <SidebarItem id="persona" label="Cognitive Rules" code="03" />
          <SidebarItem id="memory" label="Asset Memory" code="04" />
          <SidebarItem id="knowledge" label="Knowledge Base" code="05" />
          <SidebarItem id="skills" label="Skills" code="06" />
          <div className="px-10 mt-12 mb-6"><p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.3em]">Communication</p></div>
          <div
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all duration-150 border-l-2 ${
              showChat ? 'bg-white/5 border-white text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/2'
            }`}
          >
            <span className="text-[10px] font-mono opacity-50">05</span>
            <span className="text-xs font-semibold tracking-widest uppercase">Chat Room</span>
          </div>
        </nav>
        <div className="p-10 border-t border-white/10 bg-white/2">
          <div className="flex flex-col gap-1 mb-4">
            <p className="text-[9px] tracking-widest uppercase" style={{ color: '#C4956A' }}>&#8594; Cognitive Architecture Engineer</p>
            <p className="text-[9px] tracking-widest uppercase" style={{ color: '#C4956A' }}>&#8594; Chief of Intelligence Engineering</p>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 tracking-[0.15em] uppercase"><span>Auth: Restricted</span><span className="text-white/20">v1.1.0</span></div>
        </div>
      </div>

      {/* Main Content */}
      {showChat ? (
        /* Full-Page Chat Room */
        <div className="flex-1 flex flex-col bg-[#050505]">
          {/* Chat Header */}
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#08080A]/50 backdrop-blur">
            <div className="flex items-center gap-3 w-[300px]">
              <div className="w-8 h-8 border border-white/20 bg-neutral-900 flex items-center justify-center">
                <span className="text-[8px] font-mono">H</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                    {activeChatId ? (chatSessions.find(s => s.id === activeChatId)?.title || 'Chat') : 'New Chat'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-[9px] tracking-widest uppercase" style={{ color: '#C4956A' }}>Intelligence Engineer & Systems Architect</p>
              <p className="text-[9px] tracking-widest uppercase" style={{ color: '#b7ab98' }}>Principal of Augmented Engineering</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Model Selector */}
              <div className="relative">
                <button onClick={() => setShowModelDropdown(!showModelDropdown)} className="text-[8px] font-mono text-neutral-500 hover:text-white border border-white/10 px-3 py-2 rounded transition-all flex items-center gap-2">
                  <span>{availableModels.find(m => m.id === currentModel)?.name || currentModel}</span>
                  <span className="text-[6px]">▼</span>
                </button>
                {showModelDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-[#0A0A0C] border border-white/10 rounded shadow-lg z-50 min-w-[160px]">
                    {availableModels.map(m => (
                      <button key={m.id} onClick={() => switchModel(m.id)}
                        className={`w-full text-left px-4 py-2 text-[9px] hover:bg-white/10 transition-all ${m.id === currentModel ? 'text-white bg-white/5' : 'text-neutral-400'}`}>
                        <div>{m.name}</div>
                        <div className="text-[7px] text-neutral-600">{m.provider} • {m.context}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {activeChatId && (
                <button
                  onClick={clearSession}
                  className="text-[8px] font-bold px-4 py-2 uppercase tracking-widest transition-all rounded border border-white/10 text-neutral-500 hover:text-white hover:border-white/30"
                  title="Clear messages in this chat"
                >
                  Clear
                </button>
              )}
              {activeChatId && (
                <button
                  onClick={() => {
                    if (!confirm('Delete this chat?')) return;
                    fetch(`http://localhost:3999/api/chat/sessions/${activeChatId}?_method=DELETE`, { method: 'POST' })
                      .then(res => res.json())
                      .then(() => {
                        loadChatSessions();
                        setActiveChatId(null);
                        setMessages([]);
                      })
                      .catch(err => alert('Delete failed: ' + err.message));
                  }}
                  className="text-[8px] font-bold px-4 py-2 uppercase tracking-widest transition-all rounded border border-white/10 text-neutral-500 hover:text-white hover:border-white/30"
                >
                  Delete Chat
                </button>
              )}
              <button
                onClick={createNewChat}
                className="bg-white/10 hover:bg-white/20 text-white text-[8px] font-bold px-4 py-2 uppercase tracking-widest transition-all rounded"
              >
                + New Chat
              </button>
              <span className="text-[8px] font-mono text-neutral-700">
                {messages.filter(m => m.role === 'user').length} msg
              </span>
            </div>
          </div>

          {/* Chat Sessions Bar */}
          <div className="h-14 border-b border-white/10 bg-[#0A0A0C]/30 px-8 flex items-center gap-3 overflow-x-auto">
            {chatSessions.length === 0 ? (
              <span className="text-[9px] text-neutral-700">No chats yet — click + New Chat to start</span>
            ) : (
              chatSessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setActiveChatId(session.id)}
                  className={`group shrink-0 px-4 py-2 rounded-lg cursor-pointer transition-all text-[9px] max-w-[200px] truncate flex items-center gap-2 ${
                    activeChatId === session.id ? 'bg-white/10 text-white' : 'bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10'
                  }`}
                  title={session.title}
                >
                  <span className="truncate">{session.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!confirm('Delete this chat?')) return;
                      fetch(`http://localhost:3999/api/chat/sessions/${session.id}?_method=DELETE`, { method: 'POST' })
                        .then(res => res.json())
                        .then(() => {
                          loadChatSessions();
                          if (activeChatId === session.id) { setActiveChatId(null); setMessages([]); }
                        })
                        .catch(err => alert('Delete failed: ' + err.message));
                    }}
                    className="shrink-0 text-neutral-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                    title="Delete"
                  >
                    X
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Messages Area */}
          {!activeChatId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-lg">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border border-white/20">
                  <img src="/avatar.png" alt="Hermes" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-light tracking-[0.4em] uppercase mb-8 text-neutral-300">Hermes</h1>
                <button
                  onClick={createNewChat}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-8 py-3 uppercase tracking-widest transition-all rounded"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-12 md:px-24 lg:px-48 py-8 space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10">
                        <img src="/avatar.png" alt="Hermes" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                      msg.role === 'user'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-[#0A0A0C] text-neutral-300 border border-white/5'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="text-[8px] text-emerald-500 uppercase tracking-widest mb-2">Hermes</div>
                      )}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      {msg.timestamp && (
                        <div className={`text-[8px] mt-2 ${msg.role === 'user' ? 'text-neutral-500' : 'text-neutral-700'}`}>
                          {formatMessageTime(msg.timestamp)}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-mono text-neutral-500">U</span>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#0A0A0C] border border-white/5 rounded-2xl px-5 py-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-12 md:px-24 lg:px-48 py-5 border-t border-white/10">
                <div className="flex gap-4">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-[#08080A] border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-neutral-700 outline-none focus:border-white/30 resize-none h-[80px] transition-colors"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim() || isTyping}
                    className="bg-white text-black font-bold px-8 py-4 text-[9px] uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 transition-all self-end h-[80px] rounded-xl"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Dashboard Content */
        <main className="flex-1 overflow-auto p-16">
          <div className="max-w-5xl mx-auto">
            <header className="mb-16 flex justify-between items-baseline border-b border-white/10 pb-8">
              <h1 className="text-2xl font-light tracking-[0.4em] uppercase">{activeTab}</h1>
              <span className="text-[10px] font-mono text-neutral-700 uppercase tracking-[0.3em]">Secure Interface / Sentra AI</span>
            </header>
            {renderContent()}
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
