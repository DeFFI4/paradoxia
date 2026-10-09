import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  KeyRound, 
  Copy, 
  Check, 
  Plus, 
  Layers, 
  Tag, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { licenseService } from '../../services/licenseService';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';
import { License } from '../../types/license';

interface KeyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (newKeys: License[]) => void;
}

export const KeyGeneratorModal: React.FC<KeyGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
}) => {
  const toast = useToast();
  const [count, setCount] = useState<number>(1);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [note, setNote] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedList, setGeneratedList] = useState<License[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const durationPresets = [
    { label: '1 День', days: 1 },
    { label: '7 Дней', days: 7 },
    { label: '30 Дней', days: 30 },
    { label: 'Lifetime', days: 9999 },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    soundService.playTone('burst');

    try {
      const result = await licenseService.generateLicenses(
        durationDays,
        count,
        note || 'Сгенерировано вручную администратором'
      );

      setGeneratedList(result);
      onGenerated(result);
      soundService.playTone('success');
      toast.success(`Успешно создано ключей: ${result.length}`, 'Генерация завершена');
    } catch {
      toast.error('Не удалось сгенерировать ключи', 'Ошибка');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyAll = () => {
    const text = generatedList.map((k) => k.key).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    soundService.playTone('copy');
    toast.success(`Скопировано ${generatedList.length} ключей в буфер`, 'Burst Copy');
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleClose = () => {
    soundService.playTone('click');
    setGeneratedList([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-lg z-10 my-8">
        <GlassCard className="bg-cosmic-900/95 border-white/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)]">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Генератор лицензионных ключей
                </h3>
                <p className="text-xs text-slate-400">
                  Мгновенное создание одиночных или пакетных ключей Paradoxia
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {generatedList.length === 0 ? (
            <div className="space-y-5">
              {/* Duration picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Срок действия лицензии:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {durationPresets.map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => {
                        soundService.playTone('click');
                        setDurationDays(p.days);
                      }}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        durationDays === p.days
                          ? 'border-cyber-cyan bg-cyber-cyan/20 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Count selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Количество ключей:
                  </label>
                  <span className="text-xs font-mono font-bold text-cyber-cyan">
                    {count} шт.
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value, 10))}
                  className="w-full accent-cyber-cyan cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>1</span>
                  <span>10</span>
                  <span>25</span>
                  <span>50 (Burst)</span>
                </div>
              </div>

              {/* Note / Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Примечание / Тег реселлера:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Например: Platega промо / Giveaway #4"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-violet hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Криптографическая генерация...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Сгенерировать {count} {count === 1 ? 'ключ' : 'ключей'}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">
                  Создано {generatedList.length} ключей:
                </span>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="px-3 py-1.5 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/30 text-cyber-cyan text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Скопировано!' : 'Скопировать все списком'}</span>
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {generatedList.map((k) => (
                  <div
                    key={k.id}
                    className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between font-mono text-xs"
                  >
                    <code className="text-cyber-cyan font-bold select-all">{k.key}</code>
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5">
                      {k.duration_days === 9999 ? 'Lifetime' : `${k.duration_days} дн.`}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setGeneratedList([])}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-semibold text-xs transition-colors"
              >
                Создать еще ключи
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
