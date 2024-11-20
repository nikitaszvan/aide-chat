'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const Editor = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [openAIResponse, setOpenAIResponse] = useState<string | null>(null); // Store OpenAI response
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setHistory([...history, `$ ${input}`]);
      setCommandHistory([...commandHistory, input]);
      setInput('');
      setHistoryIndex(-1);
      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: input }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log('OpenAI Response:', data.message);
          setOpenAIResponse(data.message);
        } else {
          console.error('Error from OpenAI API:', data.error);
        }
      } catch (error) {
        console.error('Error during fetch:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-900 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-sm">bash</div>
      </div>
      <div
        ref={terminalRef}
        className="bg-black p-4 rounded h-80 overflow-y-auto font-mono text-sm text-green-400"
      >
        {history.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        {openAIResponse && (
          <div className="text-gray-400">OpenAI Response: {openAIResponse}</div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center">
          <ChevronRight className="mr-1 h-4 w-4" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default Editor;
