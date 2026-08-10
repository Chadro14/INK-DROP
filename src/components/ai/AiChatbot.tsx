"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Minimize2, Maximize2, Trash2, MessageSquare, ChevronDown, Sparkles } from "lucide-react";

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
          content: "👋 Bonjour ! Je suis XELIRA, ta modératrice INKDROP.\n\n🔹 Comment puis-je t'aider ?\n🔹 Pose-moi une question sur la plateforme !",
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
      }
    } catch (error) {
      console.error("Erreur lecture token:", error);
    }
    return "Utilisateur";
  };

  // ============================================
  // ENVOYER UN MESSAGE (CORRIGÉ)
  // ============================================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const userName = getUserName();
    setInput("");

    // ✅ 1. AJOUTER LE MESSAGE USER
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
    
    // ✅ Sauvegarder immédiatement le message user
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

      // ✅ 2. AJOUTER LA RÉPONSE IA (en utilisant l'état fraîchement sauvegardé)
      const assistantMsgId = `msg-${Date.now() + 1}`;
      
      // ✅ Utiliser updatedWithUser comme base (qui contient déjà le message user)
      const finalWithAssistant = updatedWithUser.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { 
                id: assistantMsgId,
                role: "assistant" as const, 
                content: data.reply || "Désolé, je n'ai pas pu répondre.", 
                timestamp: Date.now() 
              },
            ],
            updatedAt: Date.now(),
          };
        }
        return c;
      });
      
      // ✅ Sauvegarder avec le message user + réponse IA
      saveConversations(finalWithAssistant);

    } catch (error) {
      // ✅ En cas d'erreur, ajouter un message d'erreur
      const errorMsgId = `msg-${Date.now() + 2}`;
      const errorWithAssistant = updatedWithUser.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { 
                id: errorMsgId,
                role: "assistant" as const, 
                content: "❌ Désolé, une erreur est survenue. Réessaie plus tard.",
                timestamp: Date.now() 
              },
            ],
            updatedAt: Date.now(),
          };
        }
        return c;
      });
      saveConversations(errorWithAssistant);
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
  // BOUTON FLOTTANT
  // ============================================
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-4 z-50 p-0 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110 hover:shadow-blue-500/50 animate-pulse-slow group"
      >
        <img 
          src="https://files.catbox.moe/9kf0u4.png" 
          alt="XELIRA" 
          className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/50 shadow-lg group-hover:border-blue-400 transition-all"
        />
        {conversations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-zinc-950 animate-bounce">
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
    <div className={`fixed z-50 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-blue-500/10 transition-all duration-300 ease-in-out ${
      isMinimized 
        ? "bottom-28 right-4 w-72 h-14" 
        : "bottom-4 right-4 w-[95vw] max-w-md h-[85vh] max-h-[700px] animate-fade-in-up"
    }`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <img 
            src="https://files.catbox.moe/9kf0u4.png" 
            alt="XELIRA" 
            className="w-9 h-9 rounded-full object-cover border-2 border-blue-500/30 shadow-lg shadow-blue-500/20"
          />
          <div>
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              XELIRA
              <Sparkles className="w-3 h-3 text-blue-400" />
            </span>
            <span className="text-[10px] text-green-400 font-medium">● Modératrice</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200"
            title="Historique"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (conversations.length === 0 || confirm("Créer une nouvelle conversation ?")) {
                createNewConversation();
              }
            }}
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
                        ? "bg-blue-600/20 text-white border border-blue-500/30"
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
            className="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(100%-130px)] bg-gradient-to-b from-zinc-950/80 to-zinc-900/50"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <img 
                  src="https://files.catbox.moe/9kf0u4.png" 
                  alt="XELIRA" 
                  className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-blue-500/30 shadow-xl shadow-blue-500/20"
                />
                <p className="text-zinc-300 text-sm font-medium">Bonjour ! Je suis XELIRA 🤖</p>
                <p className="text-zinc-500 text-xs mt-1">Ta modératrice INKDROP</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      setInput("Comment publier sur INKDROP ?");
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-3 py-1.5 rounded-full bg-zinc-800/70 border border-zinc-700 text-zinc-300 text-[11px] hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-200"
                  >
                    Comment publier ?
                  </button>
                  <button
                    onClick={() => {
                      setInput("INKDROP est fiable ?");
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-3 py-1.5 rounded-full bg-zinc-800/70 border border-zinc-700 text-zinc-300 text-[11px] hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-200"
                  >
                    INKDROP est fiable ?
                  </button>
                  <button
                    onClick={() => {
                      setInput("Je suis débutant, par où commencer ?");
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="px-3 py-1.5 rounded-full bg-zinc-800/70 border border-zinc-700 text-zinc-300 text-[11px] hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-200"
                  >
                    Je suis débutant
                  </button>
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
                        ? "bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-none shadow-lg shadow-black/20"
                    }`}
                  >
                    {msg.content}
                    <div className={`text-[10px] mt-1 opacity-50 flex items-center gap-2 ${
                      msg.role === "user" ? "text-right text-blue-200" : "text-zinc-400"
                    }`}>
                      <span>{formatTime(msg.timestamp)}</span>
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
                <div className="bg-zinc-800 p-3 rounded-2xl rounded-bl-none shadow-lg shadow-black/20">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
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
              className="absolute bottom-24 right-4 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 animate-fade-in hover:scale-110"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* INPUT */}
          <div className="p-3 border-t border-zinc-800 flex gap-2 bg-zinc-900/95 rounded-b-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écris ton message..."
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}