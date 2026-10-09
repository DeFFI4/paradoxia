import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  KeyRound, 
  Cpu, 
  Eye, 
  Lock, 
  Sparkles,
  Flame
} from 'lucide-react';
import { soundService } from '../../services/soundService';

interface HeroSectionProps {
  onCheckKeyClick: () => void;
  onExplorePricingClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCheckKeyClick,
  onExplorePricingClick,
}) => {
  return (
    <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background radial spotlights & cyber grid mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-cyber-cyan/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-cyber-violet/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Cyber Pill Notification */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-in fade-in duration-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              Архитектура 2026: <span className="text-cyber-cyan font-mono">Hypervisor Ring0 Bypass</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan font-bold">
              NEW
            </span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-sans leading-[1.08]">
              ДОМИНИРУЙ В ИГРЕ С{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyber-cyan via-white to-cyber-violet drop-shadow-[0_0_35px_rgba(6,182,212,0.45)]">
                PARADOXIA
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Элитный комплекс приватных решений с динамической обфускацией памяти, нулевым риском детекта и ультра-плавным откликом без просадки FPS.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={() => {
                soundService.playTone('burst');
                onExplorePricingClick();
              }}
              className="relative group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-cosmic-950 overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-all duration-300 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan via-cyan-300 to-cyber-violet group-hover:opacity-90 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                <Flame className="w-4 h-4 fill-cosmic-950 text-cosmic-950" />
                <span>Получить доступ сейчас</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => {
                soundService.playTone('click');
                onCheckKeyClick();
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-semibold text-sm text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyber-cyan/40 backdrop-blur-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-95 group"
            >
              <KeyRound className="w-4 h-4 text-cyber-cyan group-hover:rotate-12 transition-transform" />
              <span>Проверить ключ активации</span>
            </button>
          </div>

          {/* Anti-Cheat Readiness Trust Badges */}
          <div className="pt-10 w-full">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">
              Совместимость и статусы защиты античитов
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {/* Badge 1 */}
              <div className="group relative p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-emerald-500/40 backdrop-blur-xl transition-all duration-300 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    100% BYPASS
                  </span>
                </div>
                <div className="font-bold text-white text-sm">Easy Anti-Cheat</div>
                <div className="text-[11px] text-slate-400">EOS & Standard (Cerberus)</div>
              </div>

              {/* Badge 2 */}
              <div className="group relative p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-emerald-500/40 backdrop-blur-xl transition-all duration-300 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                    UNDETECTED
                  </span>
                </div>
                <div className="font-bold text-white text-sm">BattlEye</div>
                <div className="text-[11px] text-slate-400">Kernel Hook Shield</div>
              </div>

              {/* Badge 3 */}
              <div className="group relative p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-cyber-cyan/40 backdrop-blur-xl transition-all duration-300 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-cyan/15 text-cyber-cyan font-bold border border-cyber-cyan/30">
                    STEALTH
                  </span>
                </div>
                <div className="font-bold text-white text-sm">Streamproof</div>
                <div className="text-[11px] text-slate-400">OBS, Discord & GeForce</div>
              </div>

              {/* Badge 4 */}
              <div className="group relative p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-cyber-violet/40 backdrop-blur-xl transition-all duration-300 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-cyber-violet/10 text-cyber-violet border border-cyber-violet/20">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyber-violet/15 text-cyber-violet font-bold border border-cyber-violet/30">
                    HARDWARE
                  </span>
                </div>
                <div className="font-bold text-white text-sm">HWID Spoofer</div>
                <div className="text-[11px] text-slate-400">Встроенный клинер и спуск</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
