"use client";

import { useState, useRef, useEffect } from "react";
import { BadgeCheck, Loader2, AtSign } from "lucide-react";

const API_URL = "https://ink-backend.vercel.app";

type User = {
  id: string;
  username: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  isCertified: boolean;
  badgeColor: string | null;
};

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionSelect: (userId: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

export function MentionInput({
  value,
  onChange,
  onMentionSelect,
  placeholder = "Écrivez...",
  maxLength = 500,
  rows = 3,
}: MentionInputProps) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [mentionQuery, setMentionQuery] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // RECHERCHE D'UTILISATEURS
  // ============================================
  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/reels/search/users?q=${encodeURIComponent(query)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data || []);
        setShowSuggestions((data.data || []).length > 0);
        setSelectedIndex(0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Erreur recherche:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounce la recherche
  useEffect(() => {
    if (mentionQuery.length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(mentionQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [mentionQuery]);

  // ============================================
  // GESTION DU CHANGEMENT
  // ============================================
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    onChange(newValue);

    // Détecter si on est en train de taper un @mention
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf("@");

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);

      // Vérifier qu'il n'y a pas d'espace après le @ et que la longueur est raisonnable
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n") && textAfterAt.length <= 30) {
        setMentionStartIndex(lastAtSymbol);
        setMentionQuery(textAfterAt);
        return;
      }
    }

    // Réinitialiser si on n'est plus dans une mention
    setShowSuggestions(false);
    setMentionStartIndex(-1);
    setMentionQuery("");
  };

  // ============================================
  // SÉLECTION D'UN UTILISATEUR
  // ============================================
  const selectUser = (user: User) => {
    if (mentionStartIndex === -1) return;

    const before = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(mentionStartIndex + 1);
    const spaceIndex = afterMention.search(/\s/);
    const afterText = spaceIndex === -1 ? "" : afterMention.slice(spaceIndex);

    // Insérer @username + espace
    const newValue = `${before}@${user.username} ${afterText}`;
    onChange(newValue);

    // ✅ Notifier le parent que ce user est mentionné
    onMentionSelect(user.id);

    // Fermer la liste
    setShowSuggestions(false);
    setMentionStartIndex(-1);
    setMentionQuery("");
    setSuggestions([]);

    // Replacer le curseur après le @username + espace
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = before.length + user.username.length + 2; // @username + espace
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  // ============================================
  // NAVIGATION CLAVIER
  // ============================================
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[selectedIndex]) {
        selectUser(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      setMentionStartIndex(-1);
      setMentionQuery("");
    }
  };

  // ============================================
  // CLIC EXTÉRIEUR → FERMER
  // ============================================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================
  // RENDU
  // ============================================
  return (
    <div className="relative">
      {/* TEXTAREA */}
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-4 py-2.5 rounded-xl bg-card/90 border border-border text-foreground placeholder-muted-foreground focus:border-purple-500 outline-none transition-all text-sm resize-none"
      />

      {/* COMPTEUR */}
      {maxLength && (
        <p className="text-right text-[10px] text-muted-foreground mt-1">
          {value.length}/{maxLength}
        </p>
      )}

      {/* INDICATEUR @ QUAND DANS UNE MENTION */}
      {mentionStartIndex !== -1 && !showSuggestions && mentionQuery.length >= 2 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 text-[10px] font-bold">
          <AtSign className="w-3 h-3" />
          Mention...
        </div>
      )}

      {/* SUGGESTIONS */}
      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute z-30 bottom-full mb-2 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
        >
          {loading && suggestions.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">
              Aucun utilisateur trouvé
            </div>
          ) : (
            suggestions.map((user, index) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectUser(user)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left border-l-2 ${
                  index === selectedIndex
                    ? "bg-purple-600/20 border-purple-500"
                    : "hover:bg-muted/50 border-transparent"
                }`}
              >
                {/* AVATAR */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0"
                  style={{ backgroundColor: user.avatarColor || "#8B5CF6" }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>

                {/* NOM */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground truncate">
                      @{user.username}
                    </span>
                    {user.isCertified && (
                      <BadgeCheck
                        className="w-3.5 h-3.5 shrink-0"
                        fill={user.badgeColor || "#3B82F6"}
                        color="black"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                </div>

                {/* HINT "ENTRÉE" */}
                {index === selectedIndex && (
                  <span className="text-[10px] text-muted-foreground font-mono hidden sm:block">
                    Entrée ↵
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
