'use client';

import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AbyssChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/abyss-chat', // This will connect to our Orchestrator later
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: '🌌 **Abyss Orchestrator Online.** Selamat datang, Chief. Sistem siap menerima instruksi AI Flow atau audit log.',
      },
    ],
  });

  return (
    <div className="flex flex-col h-[600px] w-full bg-[#0A0A0A] rounded-[32px] shadow-[20px_20px_60px_#050505,-20px_-20px_60px_#121212] overflow-hidden border border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#121212]/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#00D1FF]/10 text-[#00D1FF] shadow-[inset_2px_2px_5px_#050505,inset_-2px_-2px_5px_#1A1A1A]">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight">Command Center</h3>
            <p className="text-[10px] text-[#00D1FF] font-medium uppercase tracking-widest">Saga Live Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#00D1FF] animate-pulse shadow-[0_0_10px_#00D1FF]" />
          <span className="text-[10px] text-muted-foreground font-mono">OP-SYNC: OK</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`p-2 rounded-xl h-fit shadow-lg ${
                  m.role === 'user' 
                    ? 'bg-[#1A1A1A] text-white shadow-[4px_4px_10px_#050505,-4px_-4px_10px_#1F1F1F]' 
                    : 'bg-[#121212] text-[#00D1FF] shadow-[4px_4px_10px_#050505,-4px_-4px_10px_#1A1A1A]'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#1A1A1A] text-white rounded-tr-none shadow-[8px_8px_16px_#050505]'
                    : 'bg-[#121212] text-zinc-300 rounded-tl-none shadow-[8px_8px_16px_#050505]'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-4 items-center text-muted-foreground text-xs animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Orchestrator is processing Saga steps...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 bg-[#121212]/30 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ketik perintah atau jalankan flow..."
            className="w-full h-14 pl-6 pr-16 bg-[#0A0A0A] border-none rounded-2xl shadow-[inset_4px_4px_8px_#050505,inset_-4px_-4px_8px_#121212] text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-[#00D1FF]/30"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input}
            className="absolute right-2 h-10 w-10 bg-[#00D1FF] hover:bg-[#00D1FF]/80 text-[#0A0A0A] rounded-xl shadow-[0_0_15px_rgba(0,209,255,0.4)] transition-all active:scale-95"
          >
            <Send size={18} />
          </Button>
        </form>
        <div className="mt-4 flex gap-2 justify-center">
          <Badge variant="outline" className="text-[10px] border-[#00D1FF]/20 text-[#00D1FF]/60 cursor-pointer hover:bg-[#00D1FF]/5">/run-flow</Badge>
          <Badge variant="outline" className="text-[10px] border-white/10 text-white/40 cursor-pointer hover:bg-white/5">/audit-logs</Badge>
          <Badge variant="outline" className="text-[10px] border-white/10 text-white/40 cursor-pointer hover:bg-white/5">/system-check</Badge>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium transition-colors ${className}`}>
      {children}
    </span>
  );
}
