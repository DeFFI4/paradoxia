import React, { useState } from 'react';
import { 
  Crosshair, 
  Eye, 
  Sliders, 
  ShieldCheck, 
  Check, 
  Target, 
  Sparkles, 
  Zap, 
  Cpu, 
  Box, 
  Radio, 
  Lock
} from 'lucide-react';
import { soundService } from '../../services/soundService';

type ModuleTab = 'aimbot' | 'esp' | 'misc' | 'security';

export const FeatureMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleTab>('aimbot');

  // Interactive Live Demo States
  const [fov, setFov] = useState<number>(65);
  const [smooth, setSmooth] = useState<number>(12);
  const [hitbox, setHitbox] = useState<'head' | 'chest' | 'pelvis'>('head');
  const [silentAim, setSilentAim] = useState<boolean>(true);

  // ESP Demo States
  const [showBox, setShowBox] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showHealth, setShowHealth] = useState<boolean>(true);
  const [showDistance, setShowDistance] = useState<boolean>(true);

  // Misc Demo States
  const [rcs, setRcs] = useState<number>(85);
  const [preset, setPreset] = useState<'legit' | 'semi-rage' | 'streamer'>('legit');

  const handleTabChange = (tab: ModuleTab) => {
    soundService.playTone('click');
    setActiveTab(tab);
  };

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/25 text-cyber-cyan text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>ИНТЕРАКТИВНЫЙ ОБЗОР ФУНКЦИОНАЛА</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans">
            МОЩНЕЙШИЙ АРСЕНАЛ ВОЗМОЖНОСТЕЙ
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Тонко настраиваемый движок с нативным оверлеем и гибкими параметрами под любой стиль игры: от легитного стриминга до полного доминирования.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          <button
            onClick={() => handleTabChange('aimbot')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 border ${
              activeTab === 'aimbot'
                ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Crosshair className="w-4 h-4 text-cyber-cyan" />
            <span>Aimbot & Prediction</span>
          </button>

          <button
            onClick={() => handleTabChange('esp')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 border ${
              activeTab === 'esp'
                ? 'bg-cyber-violet/15 border-cyber-violet text-white shadow-[0_0_25px_rgba(139,92,246,0.3)]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Eye className="w-4 h-4 text-cyber-violet" />
            <span>Visuals / ESP</span>
          </button>

          <button
            onClick={() => handleTabChange('misc')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 border ${
              activeTab === 'misc'
                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Misc & Presets</span>
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 border ${
              activeTab === 'security'
                ? 'bg-rose-500/15 border-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Kernel & Ring0 Security</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="relative rounded-3xl bg-cosmic-900/60 border border-white/[0.09] backdrop-blur-2xl p-6 sm:p-10 overflow-hidden shadow-2xl">
          
          {/* TAB 1: AIMBOT */}
          {activeTab === 'aimbot' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2.5">
                    <Crosshair className="w-6 h-6 text-cyber-cyan" />
                    <span>Сверхточный векторный Aimbot</span>
                  </h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Аппаратная интерполяция движения мыши с баллистическим вычислением упреждения скорости цели и падения пули.
                  </p>
                </div>

                <div className="space-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                  {/* FOV Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Радиус захвата (FOV):</span>
                      <span className="text-cyber-cyan font-bold">{fov}°</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="180"
                      value={fov}
                      onChange={(e) => {
                        setFov(Number(e.target.value));
                        soundService.playTone('click');
                      }}
                      className="w-full accent-cyber-cyan h-2 bg-cosmic-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Smooth Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Плавность наведения (Smooth):</span>
                      <span className="text-cyber-cyan font-bold">{smooth} (Legit curve)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={smooth}
                      onChange={(e) => {
                        setSmooth(Number(e.target.value));
                        soundService.playTone('click');
                      }}
                      className="w-full accent-cyber-cyan h-2 bg-cosmic-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Hitbox Selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400">Приоритетная кость:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['head', 'chest', 'pelvis'] as const).map((bone) => (
                        <button
                          key={bone}
                          onClick={() => {
                            setHitbox(bone);
                            soundService.playTone('click');
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-mono uppercase font-bold border transition-all ${
                            hitbox === bone
                              ? 'bg-cyber-cyan/20 border-cyber-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                              : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {bone === 'head' ? 'Голова' : bone === 'chest' ? 'Грудь' : 'Таз'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Silent Aim Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-xs font-bold text-white">Silent Aim (Тихий вектор)</div>
                      <div className="text-[11px] text-slate-400">Пули летят в цель без перемещения прицела</div>
                    </div>
                    <button
                      onClick={() => {
                        setSilentAim(!silentAim);
                        soundService.playTone('click');
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        silentAim ? 'bg-cyber-cyan' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          silentAim ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-cyan" />
                    <span>Ballistic Bullet Drop Calc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-cyan" />
                    <span>Target Priority (Closest/FOV)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-cyan" />
                    <span>Visible Check (Raycast)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-cyan" />
                    <span>Ignore Knocked / Teammates</span>
                  </div>
                </div>
              </div>

              {/* Interactive Visual Canvas Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-black/60 border border-cyber-cyan/30 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                  {/* Radar/grid background lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                  
                  {/* FOV Circle */}
                  <div
                    style={{ width: `${Math.min(280, fov * 2)}px`, height: `${Math.min(280, fov * 2)}px` }}
                    className="rounded-full border border-cyber-cyan/40 bg-cyber-cyan/5 transition-all duration-200 flex items-center justify-center relative pointer-events-none"
                  >
                    <span className="absolute top-1 text-[9px] font-mono text-cyber-cyan/70">FOV {fov}°</span>
                  </div>

                  {/* Target dummy point */}
                  <div className="absolute top-1/3 right-1/3 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                    <div className="w-3 h-3 rounded-full bg-rose-500 border border-white" />
                    <span className="text-[9px] font-mono text-rose-300 mt-1 bg-black/60 px-1 rounded">Target</span>
                    
                    {/* Line from center to target */}
                    <div className="absolute top-1.5 right-1.5 w-16 h-0.5 bg-cyber-cyan/80 origin-right -rotate-45" />
                  </div>

                  {/* Crosshair Center */}
                  <div className="absolute w-6 h-6 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-cyber-cyan" />
                    <div className="h-4 w-0.5 bg-cyber-cyan absolute" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white absolute" />
                  </div>

                  {/* Live HUD telemetry */}
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-1 rounded border border-white/10">
                    BONE: <span className="text-cyber-cyan font-bold">{hitbox.toUpperCase()}</span> | SMOOTH: {smooth}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUALS / ESP */}
          {activeTab === 'esp' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2.5">
                    <Eye className="w-6 h-6 text-cyber-violet" />
                    <span>Сквозное сканирование Visuals & ESP</span>
                  </h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Мгновенное обнаружение врагов сквозь препятствия с отображением полного скелета, шкалы брони/здоровья и дистанции.
                  </p>
                </div>

                <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowBox(!showBox);
                        soundService.playTone('click');
                      }}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                        showBox ? 'bg-cyber-violet/20 border-cyber-violet text-white' : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <span>2D / 3D Corner Box</span>
                      <div className={`w-3 h-3 rounded-full ${showBox ? 'bg-cyber-violet' : 'bg-slate-700'}`} />
                    </button>

                    <button
                      onClick={() => {
                        setShowSkeleton(!showSkeleton);
                        soundService.playTone('click');
                      }}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                        showSkeleton ? 'bg-cyber-violet/20 border-cyber-violet text-white' : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <span>Bone Skeleton (Кости)</span>
                      <div className={`w-3 h-3 rounded-full ${showSkeleton ? 'bg-cyber-violet' : 'bg-slate-700'}`} />
                    </button>

                    <button
                      onClick={() => {
                        setShowHealth(!showHealth);
                        soundService.playTone('click');
                      }}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                        showHealth ? 'bg-cyber-violet/20 border-cyber-violet text-white' : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <span>Health & Armor Bar</span>
                      <div className={`w-3 h-3 rounded-full ${showHealth ? 'bg-cyber-violet' : 'bg-slate-700'}`} />
                    </button>

                    <button
                      onClick={() => {
                        setShowDistance(!showDistance);
                        soundService.playTone('click');
                      }}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                        showDistance ? 'bg-cyber-violet/20 border-cyber-violet text-white' : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <span>Distance & Weapons</span>
                      <div className={`w-3 h-3 rounded-full ${showDistance ? 'bg-cyber-violet' : 'bg-slate-700'}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-violet" />
                    <span>Snaplines (Линии к противнику)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-violet" />
                    <span>Loot & Ammo Highlighter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-violet" />
                    <span>Visible Check Glow (Зеленый/Красный)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyber-violet" />
                    <span>Spectator Warning Alert</span>
                  </div>
                </div>
              </div>

              {/* Visual Preview Box */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-black/60 border border-cyber-violet/30 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                  {/* Enemy Mock Silhouette */}
                  <div className="relative w-28 h-56 flex flex-col items-center justify-center">
                    
                    {/* ESP Box */}
                    {showBox && (
                      <div className="absolute inset-0 border-2 border-cyber-violet/90 rounded-sm shadow-[0_0_15px_rgba(139,92,246,0.4)]" />
                    )}

                    {/* Health Bar Left */}
                    {showHealth && (
                      <div className="absolute -left-3 top-0 bottom-0 w-1.5 bg-black/80 rounded overflow-hidden flex flex-col justify-end p-0.5">
                        <div className="w-full h-[78%] bg-emerald-400 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      </div>
                    )}

                    {/* Nickname & Distance */}
                    {showDistance && (
                      <>
                        <div className="absolute -top-6 text-[10px] font-mono text-white bg-black/70 px-1.5 py-0.5 rounded border border-white/10">
                          Player_01 [VULNERABLE]
                        </div>
                        <div className="absolute -bottom-6 text-[10px] font-mono text-cyber-violet bg-black/70 px-1.5 py-0.5 rounded border border-white/10">
                          48m • AK-47
                        </div>
                      </>
                    )}

                    {/* Skeleton Bones */}
                    {showSkeleton ? (
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-4 h-4 rounded-full border border-cyber-cyan bg-cyber-cyan/30" />
                        <div className="w-0.5 h-12 bg-cyber-cyan" />
                        <div className="flex gap-4">
                          <div className="w-0.5 h-16 bg-cyber-cyan rotate-12" />
                          <div className="w-0.5 h-16 bg-cyber-cyan -rotate-12" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-36 rounded bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-xs text-slate-500">
                        Entity
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MISC */}
          {activeTab === 'misc' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2.5">
                    <Sliders className="w-6 h-6 text-emerald-400" />
                    <span>Вспомогательные утилиты и RCS</span>
                  </h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Полный контроль отдачи (Recoil Compensation System), баннихоп, кастомные прицелы и моментальные пресеты конфигураций.
                  </p>
                </div>

                <div className="space-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Компенсация отдачи (RCS Strength):</span>
                      <span className="text-emerald-400 font-bold">{rcs}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rcs}
                      onChange={(e) => {
                        setRcs(Number(e.target.value));
                        soundService.playTone('click');
                      }}
                      className="w-full accent-emerald-400 h-2 bg-cosmic-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono text-slate-400">Готовые конфигурации:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['legit', 'semi-rage', 'streamer'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            setPreset(p);
                            soundService.playTone('click');
                            if (p === 'legit') {
                              setFov(45);
                              setSmooth(18);
                              setRcs(70);
                            } else if (p === 'semi-rage') {
                              setFov(120);
                              setSmooth(4);
                              setRcs(100);
                            } else {
                              setFov(30);
                              setSmooth(25);
                              setRcs(50);
                            }
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-mono uppercase font-bold border transition-all ${
                            preset === p
                              ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p === 'legit' ? 'Легит' : p === 'semi-rage' ? 'Семи-рейдж' : 'Стример'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Auto Bunnyhop (Scroll/Space)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Custom Reticle / Crosshair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Cloud Config Sync & Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>No Flash / Night Vision Hack</span>
                  </div>
                </div>
              </div>

              {/* Visual Preview Box */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-black/60 border border-emerald-500/30 flex flex-col items-center justify-center p-6 text-center overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
                    <Sliders className="w-8 h-8" />
                  </div>
                  <div className="text-white font-bold text-lg">Пресет: {preset.toUpperCase()}</div>
                  <div className="text-xs text-slate-400 mt-1 max-w-[220px]">
                    {preset === 'legit' && 'Идеально для скрытной игры, отсутствие малейших подозрений.'}
                    {preset === 'semi-rage' && 'Максимальный урон и агрессивный контроль карты.'}
                    {preset === 'streamer' && 'Чистый захват экрана без оверлеев для трансляций.'}
                  </div>
                  <div className="mt-4 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                    RCS: {rcs}% • FOV: {fov}°
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2.5">
                    <ShieldCheck className="w-6 h-6 text-rose-400" />
                    <span>Защита уровня Hypervisor Ring0</span>
                  </h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Инъекция кода через собственный подписанный гипервизор с полиморфной мутацией бинарного файла при каждом запуске.
                  </p>
                </div>

                <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Dynamic Binary Polymorphism</div>
                      <div className="text-[11px] text-slate-400">Хэш-сумма файла изменяется каждые 60 секунд на стороне сервера</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Kernel Driver Hiding</div>
                      <div className="text-[11px] text-slate-400">Изоляция страниц памяти от системных сканеров EAC/BE</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Spoofer ID Cryptolock</div>
                      <div className="text-[11px] text-slate-400">Многоуровневая подмена серийных номеров SSD, MAC и материнской платы</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-rose-400" />
                    <span>Zero Memory Page Hooking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-rose-400" />
                    <span>No Blue Screen (BSOD) Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-rose-400" />
                    <span>Anti-Leak Heartbeat Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-rose-400" />
                    <span>Windows 10 / 11 23H2 / 24H2 Ready</span>
                  </div>
                </div>
              </div>

              {/* Visual Preview Box */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] aspect-square rounded-2xl bg-black/60 border border-rose-500/30 flex flex-col items-center justify-center p-6 text-center overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4 animate-pulse">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="text-white font-bold text-lg">Hypervisor Status: ACTIVE</div>
                  <div className="text-xs font-mono text-emerald-400 mt-2 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    DETECTION RISK: 0.00%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-3">
                    Все античит-проверки успешно перехвачены на уровне кольца Ring0.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
