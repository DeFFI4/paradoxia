import React from 'react';
import { Snowflake, Flame, Ban, Cpu, Plus, Trash2, X, CheckSquare } from 'lucide-react';
import { BulkAction } from '../../types/license';
import { soundService } from '../../services/soundService';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExecuteAction: (action: BulkAction) => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onExecuteAction,
}) => {
  if (selectedCount === 0) return null;

  const handleAction = (action: BulkAction) => {
    soundService.playTone('burst');
    onExecuteAction(action);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-bounce-short">
      <div className="p-3 sm:p-4 rounded-2xl bg-cosmic-950/95 border border-cyber-cyan/50 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.35)] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-white font-semibold">
          <div className="w-6 h-6 rounded-lg bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center font-mono text-xs">
            {selectedCount}
          </div>
          <span className="hidden sm:inline">Выбрано лицензий</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          {/* Freeze */}
          <button
            onClick={() => handleAction('freeze')}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold transition-all flex items-center gap-1 whitespace-nowrap"
            title="Заморозить выбранные ключи"
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Заморозить</span>
          </button>

          {/* Unfreeze */}
          <button
            onClick={() => handleAction('unfreeze')}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition-all flex items-center gap-1 whitespace-nowrap"
            title="Разморозить выбранные ключи"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Разморозить</span>
          </button>

          {/* Reset HWID */}
          <button
            onClick={() => handleAction('reset_hwid')}
            className="px-2.5 py-1.5 rounded-xl bg-cyber-violet/10 hover:bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/30 font-semibold transition-all flex items-center gap-1 whitespace-nowrap"
            title="Сбросить привязку оборудования"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Сброс HWID</span>
          </button>

          {/* Extend 7d */}
          <button
            onClick={() => handleAction('extend_7d')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold transition-all flex items-center gap-1 whitespace-nowrap"
            title="Продлить на 7 суток"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+7 Дней</span>
          </button>

          {/* Ban */}
          <button
            onClick={() => handleAction('ban')}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold transition-all flex items-center gap-1 whitespace-nowrap"
            title="Заблокировать выбранные"
          >
            <Ban className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Бан</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => handleAction('delete')}
            className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-semibold transition-all"
            title="Удалить выбранные ключи"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Clear */}
          <button
            onClick={() => {
              soundService.playTone('click');
              onClearSelection();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Снять выделение"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
