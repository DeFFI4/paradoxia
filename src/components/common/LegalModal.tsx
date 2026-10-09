import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Lock, 
  AlertTriangle, 
  RefreshCcw, 
  ExternalLink,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { soundService } from '../../services/soundService';

export type LegalTab = 'terms' | 'privacy' | 'eula' | 'refund';

interface LegalModalProps {
  isOpen: boolean;
  defaultTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  defaultTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(defaultTab);

  if (!isOpen) return null;

  const handleTabChange = (tab: LegalTab) => {
    soundService.playTone('click');
    setActiveTab(tab);
  };

  const handleClose = () => {
    soundService.playTone('click');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl z-10 my-8">
        <GlassCard className="bg-cosmic-900/95 border-white/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.85)] max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Юридические документы и правила сервиса
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                    v2.6.4 Legal
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Официальные соглашения, политика обработки данных и правила использования ПО Paradoxia
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pb-4 overflow-x-auto flex-shrink-0 border-b border-white/[0.08]">
            <button
              onClick={() => handleTabChange('terms')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Пользовательское соглашение</span>
            </button>

            <button
              onClick={() => handleTabChange('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/40 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Политика конфиденциальности</span>
            </button>

            <button
              onClick={() => handleTabChange('eula')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'eula'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Отказ от ответственности (EULA)</span>
            </button>

            <button
              onClick={() => handleTabChange('refund')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'refund'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Политика возвратов и платежей</span>
            </button>
          </div>

          {/* Document Content Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan text-xs">
                  Настоящие Условия определяют порядок использования цифровой платформы Paradoxia и приобретения лицензионных ключей доступа. Совершая заказ или активируя ключ, Пользователь безоговорочно соглашается с данными правилами.
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">1. Предмет соглашения и цифровая лицензия</h4>
                  <p>
                    1.1. Сервис Paradoxia предоставляет конечному пользователю ограниченную, неисключительную, отзывную лицензию на использование программного комплекса в ознакомительных целях.
                  </p>
                  <p>
                    1.2. Доступ к программному обеспечению осуществляется посредством одноразовых криптографических лицензионных ключей формата <code className="text-cyber-cyan font-mono bg-black/40 px-1 py-0.5 rounded">PDX-XXXX-XXXX-XXXX</code>.
                  </p>
                  <p>
                    1.3. Привязка лицензии осуществляется к аппаратному идентификатору устройства (HWID) в момент первой успешной авторизации.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. Права и запреты</h4>
                  <p>
                    2.1. Пользователю строго запрещается:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                    <li>Осуществлять декомпиляцию, реверс-инжиниринг, внедрение отладчиков (x64dbg, IDA Pro, Cheat Engine) в модули защиты.</li>
                    <li>Передавать лицензионный ключ третьим лицам или использовать ключ одновременно на нескольких устройствах.</li>
                    <li>Публиковать алгоритмы работы драйверов Ring0 и полиморфных инжекторов.</li>
                  </ul>
                  <p>
                    2.2. При выявлении попыток взлома, дампа памяти или перепродажи ключа лицензия аннулируется немедленно без права на компенсацию, а HWID вносится в глобальный черный список.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">3. Платежи и шлюз Platega</h4>
                  <p>
                    3.1. Все финансовые транзакции проводятся через аккредитованный шлюз Platega (platega.io) с использованием современных протоколов безопасности TLS 1.3 и 3D Secure.
                  </p>
                  <p>
                    3.2. Выдача лицензионного ключа происходит автоматически в течение 10–60 секунд после подтверждения оплаты со стороны платежной системы.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-cyber-violet/10 border border-cyber-violet/20 text-cyber-violet text-xs">
                  Мы придерживаемся принципа максимальной приватности (Zero Personal Trace). Сервис не хранит персональные данные, паспортные сведения и физические адреса пользователей.
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">1. Собираемые технические данные</h4>
                  <p>
                    Для защиты от мошенничества и предотвращения несанкционированного шаринга лицензий серверное ядро Paradoxia обрабатывает исключительно следующие обезличенные хеши:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                    <li>Односторонний криптографический SHA-256 хеш компонентов оборудования (HWID).</li>
                    <li>IP-адрес в маскированном виде для защиты от сетевых атак и гео-локализации сервера обновлений.</li>
                    <li>Метки времени активации, заморозки и срока истечения ключа.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. Хранение и шифрование</h4>
                  <p>
                    2.1. Все данные хранятся в защищенных инстансах Supabase PostgreSQL с включенной политикой изоляции строк (Row Level Security - RLS).
                  </p>
                  <p>
                    2.2. Векторы авторизации и сессионные токены защищены асимметричным шифрованием. Мы никогда не передаем телеметрию третьим сторонам или рекламным сетям.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'eula' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  ВНИМАНИЕ: Программный комплекс Paradoxia предназначен исключительно для академических, исследовательских целей и тестирования систем безопасности.
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">1. Отказ от гарантий ("AS IS")</h4>
                  <p>
                    1.1. Программное обеспечение предоставляется по принципу "КАК ЕСТЬ" (AS IS). Разработчики не несут ответственности за любые последствия, возникшие в результате использования или невозможности использования данного ПО.
                  </p>
                  <p>
                    1.2. Разработчики не гарантируют совместимость с модифицированными сборками операционных систем Windows (ReviOS, Tiny10 и аналогичные кастомные дистрибутивы с вырезанными службами).
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. Риски античит-систем</h4>
                  <p>
                    2.1. Несмотря на то, что статус системы мониторится в режиме реального времени и отображается в виде бейджа (UNDETECTED / TESTING / UPDATING), использование модификаций может нарушать лицензионные соглашения третьих лиц (разработчиков игр).
                  </p>
                  <p>
                    2.2. Сервис Paradoxia не компенсирует стоимость сторонних игровых учетных записей или игрового инвентаря в случае применения санкций со стороны систем Easy Anti-Cheat, BattlEye, Ricochet или Vanguard.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'refund' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  Политика возвратов регламентирует условия компенсаций и обмена ключей согласно международным стандартам оборота цифрового контента и требованиям шлюза Platega.
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">1. Условия невозвратности</h4>
                  <p>
                    В связи с цифровой природой продукта и мгновенной доставкой уникального лицензионного ключа, возврат средств не производится в следующих случаях:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                    <li>Ключ был активирован и успешно привязан к аппаратному идентификатору HWID.</li>
                    <li>Пользователь передумал или приобрел подписку по ошибке после получения ключа.</li>
                    <li>Устройство пользователя не соответствует минимальным системным требованиям (Windows 10/11 x64, включенная виртуализация CPU).</li>
                    <li>Учетная запись была заблокирована за нарушение правил сервиса (попытка взлома/дебага).</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. Компенсации и гарантии</h4>
                  <p>
                    2.1. Если приобретенный ключ не может быть активирован по технической вине сервиса (статус ключа "banned" или "expired" на момент продажи), сервис гарантирует немедленную замену ключа на аналогичный или полный возврат средств через шлюз Platega.
                  </p>
                  <p>
                    2.2. В период технических обновлений или статуса UPDATING время действия активных подписок автоматически замораживается или продлевается администрацией.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
              <span>Защищено шифрованием Platega & Paradoxia Security Core</span>
            </div>

            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-cosmic-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Я ознакомлен и согласен
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
