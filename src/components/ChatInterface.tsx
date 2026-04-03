"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/types";
import { parseStructuredResponse } from "@/lib/parseResponse";
import StructuredResponseCard from "./StructuredResponse";

interface Props {
  onActionClick?: (action: string) => void;
}

const QUICK_PROMPTS = [
  "Write me 3 FB Marketplace listing variations",
  "How do I defend the $50 price when people lowball me?",
  "What should I do first today to get a sale?",
  "Give me a pickup logistics script for buyers",
  "When should I consider raising the price?",
];

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-orange-600/20 border border-orange-600/30 rounded-xl rounded-tr-sm px-4 py-2.5">
        <p className="text-sm text-slate-100">{content}</p>
      </div>
    </div>
  );
}

function AssistantMessage({
  message,
  isStreaming,
  onActionClick,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  onActionClick?: (action: string) => void;
}) {
  const parsed = message.parsed;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] w-full space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
            <span className="text-xs">🔥</span>
          </div>
          <span className="text-xs text-orange-400 font-semibold">Business Operator</span>
        </div>

        {parsed ? (
          <StructuredResponseCard data={parsed} onActionClick={onActionClick} />
        ) : (
          <div
            className={`bg-slate-800/60 border border-slate-700/50 rounded-xl rounded-tl-sm px-4 py-3 ${
              isStreaming ? "typing-cursor" : ""
            }`}
          >
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatInterface({ onActionClick }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content: userText.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        if (!response.ok) throw new Error("API error");

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setStreamingContent(fullText);
        }

        const parsed = parseStructuredResponse(fullText);
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: fullText,
          parsed: parsed ?? undefined,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Error: Could not reach the operator. Check your ANTHROPIC_API_KEY.",
          },
        ]);
        setStreamingContent("");
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleActionClick = (action: string) => {
    const prompt = `Execute this: ${action}. Tell me exactly what to do next, step by step.`;
    sendMessage(prompt);
    onActionClick?.(action);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center py-12">
            <div className="text-4xl">🔥</div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">
                Business Operator AI
              </h2>
              <p className="text-sm text-slate-400 max-w-sm">
                Your autonomous operator for Pickard&apos;s PEI Fire Pit Desk.
                Ask anything or use a quick prompt below.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-left text-xs text-slate-300 bg-slate-800/60 border border-slate-700/50 hover:border-orange-500/50 hover:text-slate-100 transition-colors rounded-lg px-3 py-2.5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <UserMessage key={i} content={msg.content} />
          ) : (
            <AssistantMessage
              key={i}
              message={msg}
              onActionClick={handleActionClick}
            />
          )
        )}

        {/* Streaming in-progress */}
        {isLoading && streamingContent && (
          <AssistantMessage
            message={{ role: "assistant", content: streamingContent }}
            isStreaming
            onActionClick={handleActionClick}
          />
        )}

        {/* Loading indicator (before first chunk) */}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">Operator thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the operator... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-600/50 focus:border-orange-500/50 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none transition-colors"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
