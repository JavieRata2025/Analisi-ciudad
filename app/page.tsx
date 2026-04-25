'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function Typewriter({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "¡Hola, Inspector Vial! 🕵️♂️🚦 Estoy aquí para ayudarte a analizar la seguridad vial de Torrelavega. ¿Cómo te llamas y qué calle o plaza vamos a investigar hoy?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const resetChat = () => {
    setMessages([
      { role: 'assistant', content: "¡Hola! Soy el Inspector de Calles 🕵️♂️🚦. Estoy aquí para auditar la seguridad vial de las plazas y calles de Torrelavega. ¿Qué calle o plaza vamos a investigar hoy?" }
    ]);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Interferencias en la red temporalmente... (error: ' + (error instanceof Error ? error.message : String(error)) + ')' }]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const report = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Auditoria_Seguridad_Vial_Torrelavega.md';
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#E4E3E0]">
      <header className="h-16 border-b-2 border-[#141414] flex items-center justify-between px-6 bg-[#141414] text-[#E4E3E0]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#FFD700] rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#141414] rotate-45"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono opacity-70 tracking-widest">SYSTEM-VERCEL-NODE-20.X</span>
            <h1 className="text-lg font-bold tracking-tighter uppercase italic">Control de Tráfico: Torrelavega</h1>
          </div>
        </div>
        <button onClick={resetChat} className="text-xs font-bold uppercase bg-[#E4E3E0] text-[#141414] px-4 py-2 rounded hover:bg-white">Reiniciar</button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 py-4 px-6 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#141414 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
        
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#141414] text-[#E4E3E0]'}`}>
              {m.role === 'user' ? 'U' : 'CE'}
            </div>
            <div className={`p-4 rounded-xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#141414] text-white rounded-tl-xl rounded-br-xl rounded-bl-xl' : 'bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] rounded-tr-xl rounded-br-xl rounded-bl-xl'}`}>
              {m.role === 'assistant' ? <Typewriter text={m.content} /> : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#141414] text-[#E4E3E0] flex-shrink-0 flex items-center justify-center font-bold text-xs">CE</div>
            <div className="p-4 rounded-xl bg-white border border-[#141414] shadow-[2px_2px_0px_#141414] flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-ping"></div>
              <span className="text-xs font-mono italic opacity-70">Capitán Escala está validando la precisión técnica...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t-2 border-[#141414] bg-white p-4 flex gap-4 items-center">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-3 text-sm font-mono border-2 border-[#141414] rounded focus:outline-none" placeholder="Reporte el problema de seguridad vial..." />
        <button type="submit" className="px-6 py-3 bg-[#FFD700] border-2 border-[#141414] font-bold uppercase text-xs shadow-[4px_4px_0px_#141414] hover:shadow-none active:translate-y-[2px]">Enviar</button>
        <button type="button" onClick={generateReport} className="px-6 py-3 bg-slate-200 border-2 border-[#141414] font-bold uppercase text-xs shadow-[4px_4px_0px_#141414] hover:shadow-none active:translate-y-[2px]">Generar Informe</button>
      </form>
    </div>
  );
}
