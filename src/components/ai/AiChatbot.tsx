"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Minimize2, Maximize2, Trash2, MessageSquare } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type Message = {
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
  // États principaux
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================
  // CHARGER LES CONVERSATIONS DEPUIS localStorage
  // ============================================
  useEffect(() => {
    const saved = localStorage.getItem("xelira_conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        
        // Charger la dernière conversation active
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
  // SAUVEGARDER LES CONVERSATIONS
  // ============================================
  const saveConversations = (newConversations: Conversation[]) => {
    setConversations(newConversations);
    localStorage.setItem("xelira_conversations", JSON.stringify(newConversations));
  };

  // ============================================
  // CRÉER UNE NOUVELLE CONVERSATION
  // ============================================
  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `Conversation ${conversations.length + 1}`,
      messages: [
        {
          role: "assistant",
          content: "👋 Bonjour ! Je suis XELIRA, ton guide INKDROP. Comment puis-je t'aider ?",
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
    
    if (currentConversationId === id) {
      if (updated.length > 0) {
        setCurrentConversationId(updated[0].id);
        localStorage.setItem("xelira_active_conversation", updated[0].id);
      } else {
        setCurrentConversationId(null);
        localStorage.removeItem("xelira_active_conversation");
        // Créer une nouvelle conversation automatiquement
        createNewConversation();
      }
    }
  };

  // ============================================
  // CHARGER UNE CONVERSATION
  // ============================================
  const loadConversation = (id: string) => {
    setCurrentConversationId(id);
    localStorage.setItem("xelira_active_conversation", id);
    setIsHistoryOpen(false);
  };

  // ============================================
  // OBTENIR LA CONVERSATION ACTUELLE
  // ============================================
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // ============================================
  // ENVOYER UN MESSAGE
  // ============================================
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Ajouter le message utilisateur
    const updatedConversations = conversations.map(c => {
      if (c.id === currentConversationId) {
        const newMessages = [
          ...c.messages,
          { role: "user" as const, content: userMessage, timestamp: Date.now() },
        ];
        return { 
          ...c, 
          messages: newMessages, 
          updatedAt: Date.now(),
          // Mettre à jour le titre avec le premier message
          title: c.messages.length === 1 ? userMessage.slice(0, 30) + "..." : c.title,
        };
      }
      return c;
    });
    saveConversations(updatedConversations);

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
          firstName: "Utilisateur",
        }),
      });

      const data = await res.json();

      // Ajouter la réponse de l'assistant
      const finalConversations = conversations.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { 
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
      saveConversations(finalConversations);

    } catch (error) {
      // En cas d'erreur, ajouter un message d'erreur
      const errorConversations = conversations.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { 
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
      saveConversations(errorConversations);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AUTO-SCROLL
  // ============================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================================
  // RACCOURCIS CLAVIER
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Suggestions rapides
  const quickSuggestions = [
    "Comment publier un manga ?",
    "Comment gagner de l'argent ?",
    "Comment devenir certifié ?",
    "C'est quoi INKDROP ?",
    "Comment lire un manga ?",
  ];

  // ============================================
  // AFFICHAGE BOUTON FLOTTANT (fermé)
  // ============================================
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-4 z-50 p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-110 group"
      >
        <Bot className="w-6 h-6" />
        {conversations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-zinc-950">
            {conversations.length}
          </span>
        )}
      </button>
    );
  }

  // ============================================
  // AFFICHAGE FENÊTRE CHAT
  // ============================================
  return (
    <div className={`fixed z-50 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-blue-500/10 transition-all ${
      isMinimized 
        ? "bottom-28 right-4 w-72 h-14" 
        : "bottom-4 right-4 w-[95vw] max-w-md h-[80vh] max-h-[600px]"
    }`}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-white text-sm">XELIRA</span>
          <span className="text-[10px] text-green-400 font-semibold px-2 py-0.5 bg-green-500/10 rounded-full">En ligne</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
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
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            title="Nouvelle conversation"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* HISTORIQUE DES CONVERSATIONS */}
          {isHistoryOpen && (
            <div className="absolute top-12 left-0 right-0 bg-zinc-900 border-b border-zinc-800 p-2 z-10 max-h-40 overflow-y-auto rounded-b-2xl">
              {conversations.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-2">Aucune conversation</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      conv.id === currentConversationId
                        ? "bg-zinc-800 text-white"
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
                      className="p-1 rounded hover:bg-red-600/20 text-zinc-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(100%-110px)]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-12 h-12 text-zinc-700 mb-3" />
                <p className="text-zinc-400 text-sm">Bonjour ! Je suis XELIRA.</p>
                <p className="text-zinc-500 text-xs">Pose-moi une question sur INKDROP.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }} />
                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTIONS RAPIDES */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-[11px] hover:bg-zinc-700 hover:text-white transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div className="p-3 border-t border-zinc-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Pose ta question..."
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
