import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Replace with your actual backend server endpoint URL
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error communicating with AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '5px 10px 10px 10px' }}>
      <div style={{ height: '80px', overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: '5px 0', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <span title="AI ChatBot">{msg.role === 'user' ? <User size={16} /> : <Bot size={25} />} </span>
            <p style={{ display: 'inline-block', background: msg.role === 'user' ? '#007bff' : '#f1f1f1', color: msg.role === 'user' ? '#fff' : '#000', padding: '8px', borderRadius: '4px' }}>
              {msg.content}
            </p>
          </div>
        ))}
        {loading && <p>AI is thinking...</p>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask something..." 
          style={{ flexGrow: 1, padding: '4px' }}
        />
        <button type="submit" ><Send size={16} /></button>
      </form>
    </div>
  );
}