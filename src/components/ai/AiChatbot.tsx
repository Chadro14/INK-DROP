"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Minimize2, Maximize2, Trash2, MessageSquare, ChevronDown, Sparkles, RefreshCw, Zap } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // RÉCUPÉRER LE NOM DE L'UTILISATEUR
  // ============================================
  const getUserName = (): string => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.username) {
          return payload.username.replace(/^@/, '');
        }
        if (payload.firstName) {
          return payload.firstName;
        }
      }
    } catch (error) {
      console.error("Erreur lecture token:", error);
    }

    const storedName = localStorage.getItem("user_name");
    if (storedName) return storedName;

    return "Utilisateur";
  };

  // ============================================
  // CHARGER LES CONVERSATIONS
  // ============================================
  useEffect(() => {
    const saved = localStorage.getItem("xelira_conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);

        const lastActive = parsed.find((c: Conversation) => c.id === localStorage.getItem("xelira_active_conversation"));
        if (lastActive) {
          setCurrentConversationId(lastActive.id);
        } else if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
          localStorage.setItem("xelira_active_conversation", parsed[0].id);
        }
      } catch (error) {
        console.error("Erreur chargement historique:", error);
      }
    }
  }, []);

  // ============================================
  // SAUVEGARDER
  // ============================================
  const saveConversations = (newConversations: Conversation[]) => {
    setConversations(newConversations);
    localStorage.setItem("xelira_conversations", JSON.stringify(newConversations));
  };

  // ============================================
  // CRÉER NOUVELLE CONVERSATION
  // ============================================
  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `👋 Bonjour ${getUserName()} ! Je suis **XELIRA**, ton agent modérateur INKDROP.\n\n🔹 Comment puis-je t'aider aujourd'hui ?\n🔹 Pose-moi une question sur la plateforme !`,
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [...conversations, newConv];
    saveConversations(updated);
    setCurrentConversationId(newConv.id);
    localStorage.setItem("xelira_active_conversation", newConv.id);
    setIsHistoryOpen(false);
  };

  // ============================================
  // SUPPRIMER UNE CONVERSATION
  // ============================================
  const deleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    saveConversations(updated);

    if (updated.length > 0) {
      setCurrentConversationId(updated[0].id);
      localStorage.setItem("xelira_active_conversation", updated[0].id);
    } else {
      setCurrentConversationId(null);
      localStorage.removeItem("xelira_active_conversation");
      createNewConversation();
    }
  };

  // ============================================
  // SUPPRIMER UN MESSAGE
  // ============================================
  const deleteMessage = (conversationId: string, messageId: string) => {
    const updatedConversations = conversations.map(c => {
      if (c.id === conversationId) {
        const filteredMessages = c.messages.filter(m => m.id !== messageId);
        return {
          ...c,
          messages: filteredMessages,
          updatedAt: Date.now(),
        };
      }
      return c;
    });
    saveConversations(updatedConversations);
  };

  // ============================================
  // CHARGER UNE CONVERSATION
  // ============================================
  const loadConversation = (id: string) => {
    setCurrentConversationId(id);
    localStorage.setItem("xelira_active_conversation", id);
    setIsHistoryOpen(false);
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // ============================================
  // FORMATER LE CONTENU COMME CLAUDE
  // ============================================
  const formatContent = (content: string) => {
    if (!content) return null;

    let formatted = content.split('\n').map((line, i) => {
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <div key={i} className="flex items-start gap-2 text-zinc-200 text-sm">
          <span className="text-blue-400 mt-0.5">▸</span>
          <span>{line.trim().replace(/^[•-]\s*/, '')}</span>
        </div>;
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return <div key={i} className="text-sm font-semibold text-white mt-1.5">
          {parts.map((part, index) => (
            index % 2 === 1 ? <span key={index} className="text-blue-400">{part}</span> : <span key={index}>{part}</span>
          ))}
        </div>;
      }
      if (/^[📁📋🔍✅❌⚠️ℹ️🎯📖💰👑⭐🛠️🚀]/.test(line.trim())) {
        return <div key={i} className="text-sm font-semibold text-white mt-1.5">{line}</div>;
      }
      if (line.trim() === '') {
        return <div key={i} className="h-1" />;
      }
      return <div key={i} className="text-sm text-zinc-200 leading-relaxed">{line}</div>;
    });

    return <div className="space-y-0.5">{formatted}</div>;
  };

  // ============================================
  // ENVOYER UN MESSAGE
  // ============================================
  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || loading) return;

    const userMessage = messageToSend;
    const userName = getUserName();
    setInput("");
    setRetryMessage(null);

    const userMsgId = `msg-${Date.now()}`;
    const updatedWithUser = conversations.map(c => {
      if (c.id === currentConversationId) {
        const newMessages = [
          ...c.messages,
          { 
            id: userMsgId,
            role: "user" as const, 
            content: userMessage, 
            timestamp: Date.now() 
          },
        ];
        return { 
          ...c, 
          messages: newMessages, 
          updatedAt: Date.now(),
          title: c.messages.length === 1 ? userMessage.slice(0, 30) + "..." : c.title,
        };
      }
      return c;
    });
    saveConversations(updatedWithUser);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: history,
          firstName: userName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Erreur serveur");
      }

      const assistantMsgId = `msg-${Date.now() + 1}`;
      const finalWithAssistant = updatedWithUser.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { 
                id: assistantMsgId,
                role: "assistant" as const, 
                content: data.reply || "Je n'ai pas pu répondre. Réessaie plus tard.", 
                timestamp: Date.now() 
              },
            ],
            updatedAt: Date.now(),
          };
        }
        return c;
      });
      saveConversations(finalWithAssistant);

    } catch (error: any) {
      const errorMsgId = `msg-${Date.now() + 2}`;
      const errorContent = `❌ **Erreur technique**\n\n${error.message || "Une erreur est survenue."}\n\nVeuillez réessayer dans quelques instants.`;
      
      const errorWithAssistant = updatedWithUser.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { 
                id: errorMsgId,
                role: "assistant" as const, 
                content: errorContent,
                timestamp: Date.now() 
              },
            ],
            updatedAt: Date.now(),
          };
        }
        return c;
      });
      saveConversations(errorWithAssistant);
      setRetryMessage(userMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AUTO-SCROLL
  // ============================================
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;

      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // ============================================
  // SUGGESTIONS
  // ============================================
  const suggestions = [
    { label: "📖 Comment publier ?", value: "Comment publier un manga sur INKDROP ?" },
    { label: "🏷️ Tags pour mon manga", value: "Donne-moi des tags pour mon manga" },
    { label: "📊 Analyse mon manga", value: "Analyse mon manga et donne-moi des conseils" },
    { label: "💰 Comment gagner de l'argent ?", value: "Comment gagner de l'argent sur INKDROP ?" },
    { label: "⭐ Certification", value: "Comment être certifié sur INKDROP ?" },
    { label: "👑 Abonnement Premium", value: "Explique-moi les abonnements Premium" },
  ];

  // ============================================
  // BOUTON FLOTTANT
  // ============================================
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-4 z-50 p-0 rounded-full shadow-lg shadow-cyan-500/30 transition-all hover:scale-110 hover:shadow-cyan-500/50 animate-pulse-slow group"
      >
        <img 
          src="https://files.catbox.moe/9kf0u4.png" 
          alt="XELIRA" 
          className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/50 shadow-lg group-hover:border-cyan-400 transition-all"
        />
        {conversations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-zinc-950 animate-bounce">
            {conversations.length}
          </span>
        )}
      </button>
    );
  }

  // ============================================
  // FENÊTRE CHAT
  // ============================================
  return (
    <div className={`fixed z-50 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-cyan-500/10 transition-all duration-300 ease-in-out ${
      isMinimized 
        ? "bottom-28 right-4 w-72 h-14" 
        : "bottom-4 right-4 w-[95vw] max-w-md h-[85vh] max-h-[700px] animate-fade-in-up"
    }`}>

      {/* HEADER - COULEUR CYAN */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://files.catbox.moe/9kf0u4.png" 
              alt="XELIRA" 
              className="w-9 h-9 rounded-full object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/30"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
          </div>
          <div>
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              XELIRA
              <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">● Modératrice</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200"
            title="Historique"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={createNewConversation}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200"
            title="Nouvelle conversation"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* HISTORIQUE */}
          {isHistoryOpen && (
            <div className="absolute top-14 left-0 right-0 bg-zinc-900 border-b border-zinc-800 p-2 z-10 max-h-40 overflow-y-auto rounded-b-2xl animate-fade-in">
              {conversations.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-2">Aucune conversation</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      conv.id === currentConversationId
                        ? "bg-cyan-600/20 text-white border border-cyan-500/30"
                        : "hover:bg-zinc-800/50 text-zinc-400"
                    }`}
                  >
                    <span
                      onClick={() => loadConversation(conv.id)}
                      className="flex-1 text-sm truncate"
                    >
                      {conv.title || "Nouvelle conversation"}
                    </span>
                    <button
                      onClick={() => deleteConversation(conv.id)}
                      className="p-1 rounded hover:bg-red-600/20 text-zinc-500 hover:text-red-400 transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MESSAGES */}
          <div 
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(100%-120px)] bg-gradient-to-b from-zinc-950/80 to-zinc-900/50"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <div className="relative">
                  <img 
                    src="https://files.catbox.moe/9kf0u4.png" 
                    alt="XELIRA" 
                    className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                    <span className="text-[8px] font-bold">✓</span>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm font-medium">Bonjour {getUserName()} !</p>
                <p className="text-zinc-500 text-xs mt-1">Je suis XELIRA, ton agent modérateur</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xs">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(sug.value)}
                      className="px-3 py-1.5 rounded-full bg-zinc-800/70 border border-zinc-700 text-zinc-300 text-[11px] hover:bg-cyan-600 hover:text-white hover:border-cyan-500 transition-all duration-200"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm relative transition-all duration-200 ${
                      msg.role === "user"
                        ? "bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-500/30"
                        : "bg-zinc-800/90 text-zinc-200 rounded-bl-none shadow-lg shadow-black/20 border border-zinc-700/50"
                    }`}
                  >
                    {msg.role === "assistant" ? formatContent(msg.content) : msg.content}
                    
                    <div className={`text-[10px] mt-2 opacity-50 flex items-center gap-2 ${
                      msg.role === "user" ? "text-right text-cyan-200" : "text-zinc-500"
                    }`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.role === "assistant" && msg.content.includes("❌ Erreur technique") && retryMessage && (
                        <button
                          onClick={() => sendMessage(retryMessage)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-all"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Réessayer</span>
                        </button>
                      )}
                      {msg.role === "user" && (
                        <button
                          onClick={() => {
                            if (currentConversationId && confirm("Supprimer ce message ?")) {
                              deleteMessage(currentConversationId, msg.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-zinc-800/90 p-3 rounded-2xl rounded-bl-none shadow-lg shadow-black/20 border border-zinc-700/50">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* BOUTON SCROLL */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-24 right-4 p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 transition-all duration-200 animate-fade-in hover:scale-110"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* INPUT - AMÉLIORÉ ET REDRESSÉ */}
          <div className="p-3 pt-2 border-t border-zinc-800 bg-zinc-900/95 rounded-b-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Écris ton message..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all duration-200 text-sm"
                />
                {input.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                    {input.length}
                  </div>
                )}
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
