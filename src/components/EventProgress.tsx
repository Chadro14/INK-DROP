"use client";

import { CheckCircle2, Target, Clock, Award } from "lucide-react";

interface Objective {
  id: string;
  description: string;
  target: number;
  current: number;
}

interface EventProgressProps {
  objectives: Objective[];
  progress: any;
  isCompleted?: boolean;
  rewardClaimed?: boolean;
  onClaimReward?: () => void;
  isClaiming?: boolean;
}

export function EventProgress({
  objectives,
  progress,
  isCompleted = false,
  rewardClaimed = false,
  onClaimReward,
  isClaiming = false,
}: EventProgressProps) {
  // Calculer la progression globale
  const totalProgress = objectives.reduce((acc, obj) => {
    const current = progress?.[obj.id] || 0;
    return acc + (current / obj.target);
  }, 0) / objectives.length * 100;

  const allCompleted = objectives.every((obj) => {
    const current = progress?.[obj.id] || 0;
    return current >= obj.target;
  });

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-400" />
        Progression
      </h3>

      {/* Barre de progression globale */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-zinc-400">Objectifs</span>
          <span className="text-zinc-400 font-medium">
            {Math.round(Math.min(totalProgress, 100))}%
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalProgress >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
            }`}
            style={{ width: `${Math.min(totalProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Liste des objectifs */}
      <div className="space-y-3">
        {objectives.map((obj) => {
          const current = progress?.[obj.id] || 0;
          const objProgress = Math.min((current / obj.target) * 100, 100);
          const isObjCompleted = current >= obj.target;

          return (
            <div key={obj.id} className="bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isObjCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-600" />
                  )}
                  <span className={`text-sm ${isObjCompleted ? "text-emerald-300" : "text-zinc-300"}`}>
                    {obj.description}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  {current} / {obj.target}
                </span>
              </div>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isObjCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
                  style={{ width: `${objProgress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Statut */}
      {allCompleted && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Objectifs atteints !</p>
            <p className="text-xs text-emerald-400/70">
              {rewardClaimed 
                ? "Récompenses déjà réclamées 🎉" 
                : "Vous pouvez réclamer vos récompenses !"}
            </p>
          </div>
        </div>
      )}

      {/* Bouton de réclamation */}
      {allCompleted && !rewardClaimed && onClaimReward && (
        <button
          onClick={onClaimReward}
          disabled={isClaiming}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold transition-all shadow-amber-600/20 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isClaiming ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Réclamation...
            </>
          ) : (
            <>
              <Award className="w-4 h-4" />
              Réclamer les récompenses
            </>
          )}
        </button>
      )}

      {/* Récompenses réclamées */}
      {rewardClaimed && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">✅ Récompenses réclamées</span>
        </div>
      )}
    </div>
  );
}
