"use client";

import React from "react";
import { User, Bot } from "lucide-react";

export function InterviewTranscriptView({ messages }) {
  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div key={m.id} className={`flex gap-3 max-w-3xl ${m.sender === 'candidate' ? 'ml-auto flex-row-reverse' : ''}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.sender === 'candidate' ? 'bg-blue-500/10 text-blue-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
            {m.sender === 'candidate' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
          </div>
          <div className={`p-3 rounded-2xl ${m.sender === 'candidate' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-muted/40 rounded-tl-none'} text-sm leading-relaxed`}> 
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase">{m.sender}</div>
            <div className="whitespace-pre-wrap">{m.content}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
