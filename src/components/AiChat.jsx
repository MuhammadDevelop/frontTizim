import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Assalomu aleykum! Menda qanday yordam bera olaman?", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        text: "Hozircha men test rejimida ishlayapman. Tez orada haqiqiy yordamchi AI sizga xizmat qiladi! 😊", 
        sender: "ai" 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Chat Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #5a52d5)',
            color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(108, 99, 255, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="ai-chat-btn"
        >
          <FiMessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '350px', height: '500px', backgroundColor: '#fff',
          borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'chat-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6C63FF, #5a52d5)', padding: '16px 20px',
            color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C63FF', fontWeight: 'bold' }}>AI</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Tizim Yordamchisi</h4>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
              <FiMinimize2 size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%', padding: '12px 16px',
                backgroundColor: msg.sender === 'user' ? '#6C63FF' : '#fff',
                color: msg.sender === 'user' ? '#fff' : '#333',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '0.9rem', lineHeight: 1.4
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #f0f0f0',
            display: 'flex', gap: '8px'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Xabar yozing..." 
              style={{
                flex: 1, padding: '12px 16px', border: '1px solid #e0e0e0',
                borderRadius: '24px', outline: 'none', fontSize: '0.9rem'
              }}
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: input.trim() ? '#6C63FF' : '#e0e0e0',
                color: '#fff', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        .ai-chat-btn:hover { transform: scale(1.1); }
        @keyframes chat-pop {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
