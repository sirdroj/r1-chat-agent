"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "agent"; content: string }
  | { role: "image"; src: string; caption?: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
  async function initialGreeting() {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: "Hello",
      }),
    });

    const data = await res.json();

    if (data.type === "image") {
      setMessages([
        { role: "agent", content: data.message },
        { role: "image", src: data.image },
      ]);
    } else {
      setMessages([{ role: "agent", content: data.message }]);
    }
  }

  initialGreeting();
}, []); // Empty dependency array means this runs once on mount

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: newMessages.map(m => m.content).join("\n"),
      }),
    });

    const data = await res.json();

    if (data.type === "image") {
      setMessages(prev => [
        ...prev,
        { role: "agent", content: data.message },
        { role: "image", src: data.image },
      ]);
    } else {
      setMessages(prev => [...prev, { role: "agent", content: data.message }]);
    }
  }

  // Handle Enter key press
  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-screen h-[640px] bg-blue-500 rounded-3xl p-4 flex flex-col">
        
        {/* Header */}
        <div className="text-white font-semibold mb-3">
          Bright Assistant <span className="text-green-400 text-l ml-2.5">•</span> Online
        </div>

        {/* Chat */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m, i) => {
            if (m.role === "image") {
              return (
                <Image
                  key={i}
                  src={m.src}
                  alt="agent"
                  width={220}
                  height={160}
                  className="rounded-xl"
                />
              );
            }

            return (
              <div
              key={i}
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-blue-600 ml-auto"
                  : "bg-blue-200 text-blue-900"
              }`}
              dangerouslySetInnerHTML={{ __html: m.content }}
            />
            );
          })}
          {/* Auto-scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-full px-4 py-2 text-sm"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-white text-indigo-600 px-4 rounded-full"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}