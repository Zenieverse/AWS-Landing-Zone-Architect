import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, QuestionnaireInputs } from "../types";
import { MessageSquare, Send, Bot, User, RefreshCw, Sparkles } from "lucide-react";

interface AdvisorChatProps {
  inputs: QuestionnaireInputs;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({ inputs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: `Hello! I am your virtual AWS Principal Solutions Architect and SRE Lead. 

Based on your profile for **${inputs.orgName || "Acme Enterprise"}**, I am ready to review your network segments, help with compliance auditing (SOC2/HIPAA), recommend SSO configurations, or answer custom operational guidelines.

What architectural or DevSecOps questions do you have for me today?`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/landing-zone/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: inputs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact advisor server API");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      console.error("Advisor chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: `⚠️ Sorry, I ran into a configuration audit lag: ${err.message || "Unknown proxy error"}. Please check your GEMINI_API_KEY and retry.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Quick prompt presets
  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <div id="advisor-consultant-chat" className="bg-brand-surface rounded-xl border border-brand-border shadow-2xl flex flex-col h-[600px] overflow-hidden">
      
      {/* Header banner */}
      <div className="px-5 py-4 bg-brand-surface-alt border-b border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-brand-accent animate-pulse" />
          <div className="text-left">
            <h3 className="font-bold text-brand-text text-xs">Principal AWS Advisor & Architect</h3>
            <span className="text-[10px] text-emerald-400 font-mono block">● Online (Consulting Services)</span>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: "init",
                role: "assistant",
                content: `Architect conversation log cleared. Ask me anything about scaling, security setups, or standard IAM SSO implementations!`,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
          }}
          className="text-xs text-brand-text-dim hover:text-brand-text p-1 rounded hover:bg-brand-bg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" /> Reset Logs
        </button>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-brand-bg/40">
        {messages.map((m) => {
          const isModel = m.role === "assistant";
          return (
            <div key={m.id} className={`flex gap-3 text-left ${isModel ? "" : "flex-row-reverse"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isModel ? "bg-brand-accent/20 border border-brand-accent/30" : "bg-sky-500/20 border border-sky-400/30"
              }`}>
                {isModel ? <Bot className="w-4 h-4 text-brand-accent" /> : <User className="w-4 h-4 text-sky-450" />}
              </div>
              
              <div className="max-w-[80%] space-y-1">
                <div className={`p-3.5 rounded-xl text-xs whitespace-pre-wrap leading-relaxed ${
                  isModel
                    ? "bg-brand-surface text-brand-text rounded-tl-none border border-brand-border"
                    : "bg-brand-accent text-white rounded-tr-none"
                }`}>
                  {m.content}
                </div>
                <span className="text-[9px] text-brand-text-dim font-mono block px-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-brand-accent animate-bounce" />
            </div>
            <div className="p-3 bg-brand-surface-alt rounded-xl text-xs text-brand-text-dim border border-brand-border">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" /> Thinking and formulating AWS blueprints...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions presets bar */}
      <div className="px-4 py-2 bg-brand-surface border-t border-brand-border flex gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-[10px] text-brand-text-dim font-sans select-none justify-start items-center">
        <span className="flex items-center gap-1 text-brand-text-dim/60 shrink-0"><Sparkles className="w-3 h-3 text-yellow-405" /> Presets:</span>
        <button
          onClick={() => handleQuickPrompt("How do I integrate Single Sign-on (SSO) using Azure AD for this organization?")}
          className="px-2.5 py-1 bg-brand-bg hover:bg-brand-surface-alt rounded border border-brand-border cursor-pointer text-brand-text mr-1 shrink-0"
        >
          SSO Azure Integration
        </button>
        <button
          onClick={() => handleQuickPrompt("Is ECS with AWS Fargate better or EKS with Spot Nodes for our team size?")}
          className="px-2.5 py-1 bg-brand-bg hover:bg-brand-surface-alt rounded border border-brand-border cursor-pointer text-brand-text mr-1 shrink-0"
        >
          ECS vs EKS Choice
        </button>
        <button
          onClick={() => handleQuickPrompt("What IAM SCP barriers should I put in place to enforce logging and prevent deletion of Audit Vaults?")}
          className="px-2.5 py-1 bg-brand-bg hover:bg-brand-surface-alt rounded border border-brand-border cursor-pointer text-brand-text shrink-0"
        >
          Guardrail Policies
        </button>
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSend} className="p-4 bg-brand-surface-alt border-t border-brand-border flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask the AWS SRE Advisor about "${inputs.orgName || "Acme Enterprise"}" blueprint...`}
          className="flex-1 px-3 py-2 bg-brand-bg text-xs rounded border border-brand-border text-brand-text focus:border-brand-accent focus:outline-none"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending}
          className="px-4 py-2 bg-brand-accent hover:opacity-95 text-white rounded font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>

    </div>
  );
};
