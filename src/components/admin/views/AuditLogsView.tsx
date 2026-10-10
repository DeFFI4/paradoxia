import React, { useState, useEffect, useMemo } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  Code,
  Copy,
  Check,
  X,
  Sparkles,
  CheckCircle2,
  Ban,
  ShieldAlert,
  ShieldCheck,
  Activity,
  KeyRound,
  Terminal,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuditLog } from '../../../types/license';
import { licenseService } from '../../../services/licenseService';
import { soundService } from '../../../services/soundService';
import { GlassCard } from '../../common/GlassCard';
import { useToast } from '../../common/Toast';

interface AuditLogsViewProps {
  onRefreshStats?: () => void;
}

type ActionFilterType = 'all' | AuditLog['action'];

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ onRefreshStats }) => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilterType>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await licenseService.getAuditLogs();
      setLogs(data);
    } catch {
      toast.error('Не удалось загрузить журнал аудита');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    soundService.playTone('click');
    await loadData();
    onRefreshStats?.();
    toast.info('Журнал аудита обновлен', 'Синхронизация');
  };

  const handleExportJson = () => {
    soundService.playTone('click');
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `paradoxia_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Логи успешно экспортированы в JSON');
    } catch {
      toast.error('Ошибка при экспорте логов');
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Вы действительно хотите очистить журнал аудита? Это действие необратимо.')) {
      return;
    }
    soundService.playTone('alert');
    try {
      await licenseService.clearAuditLogs();
      toast.info('Журнал аудита очищен');
      await loadData();
      onRefreshStats?.();
    } catch {
      toast.error('Ошибка очистки журнала');
    }
  };

  const toggleExpand = (id: string) => {
    soundService.playTone('click');
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyJson = async (log: AuditLog) => {
    soundService.playTone('burst');
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2));
      setCopiedId(log.id);
      toast.success('JSON скопирован в буфер обмена');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Не удалось скопировать данные');
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const inId = log.id.toLowerCase().includes(q);
      const inAction = log.action.toLowerCase().includes(q);
      const inSource = (log.ip_or_source || '').toLowerCase().includes(q);
      const inDetails = JSON.stringify(log.details).toLowerCase().includes(q);

      return inId || inAction || inSource || inDetails;
    });
  }, [logs, actionFilter, search]);

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'generate':
        return {
          label: 'Генерация',
          icon: Sparkles,
          className: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/30',
        };
      case 'activate':
        return {
          label: 'Активация',
          icon: CheckCircle2,
          className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      case 'reset_hwid':
        return {
          label: 'Сброс HWID',
          icon: RefreshCw,
          className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        };
      case 'ban':
        return {
          label: 'Блокировка',
          icon: Ban,
          className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        };
      case 'freeze':
        return {
          label: 'Заморозка',
          icon: ShieldAlert,
          className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        };
      case 'unfreeze':
        return {
          label: 'Разморозка',
          icon: ShieldCheck,
          className: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
        };
      case 'delete':
        return {
          label: 'Удаление',
          icon: Trash2,
          className: 'bg-rose-600/15 text-rose-400 border-rose-600/30',
        };
      case 'status_change':
        return {
          label: 'Статус чита',
          icon: Activity,
          className: 'bg-cyber-violet/15 text-cyber-violet border-cyber-violet/30',
        };
      case 'hwid_blacklist':
        return {
          label: 'HWID Бан',
          icon: Ban,
          className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        };
      default:
        return {
          label: action,
          icon: KeyRound,
          className: 'bg-white/10 text-slate-300 border-white/10',
        };
    }
  };

  const formatSummary = (log: AuditLog): string => {
    const d = log.details as Record<string, any>;
    switch (log.action) {
      case 'generate':
        return `Сгенерировано ключей: ${d.count || 1} шт. (${d.duration_days >= 9999 ? 'Lifetime' : (d.duration_days || '30') + ' дн.'}) ${d.note ? `— "${d.note}"` : ''}`;
      case 'activate':
        return `Ключ ${d.key || d.license_id || ''} активирован на HWID: ${d.hwid || 'N/A'}`;
      case 'reset_hwid':
        return `Сброшена аппаратная привязка HWID для ключа ${d.key || d.id || 'N/A'}`;
      case 'ban':
        return `Блокировка ключа ${d.key || d.id || ''}: ${d.reason || 'Нарушение регламента'}`;
      case 'freeze':
        return `Заморозка лицензии ${d.key || d.id || ''}`;
      case 'unfreeze':
        return `Разморозка лицензии ${d.key || d.id || ''}`;
      case 'delete':
        return `Удален ключ ${d.key || d.id || ''}`;
      case 'status_change':
        return `Обновление статуса: ${d.previous || 'N/A'} -> ${d.current || d.status || 'N/A'} (Версия: ${d.version || 'v3.4.2'})`;
      case 'hwid_blacklist':
        return `HWID ${d.hwid}: ${d.action === 'banned' ? 'внесен в бан-лист' : 'удален из бан-листа'} ${d.reason ? `(${d.reason})` : ''}`;
      default:
        return JSON.stringify(d);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyber-violet/10 border border-cyber-violet/20 text-cyber-violet">
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white tracking-wide">
              Журнал аудита действий
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Неизменяемый реестр административных событий, аудит модификаций и контроль доступа
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportJson}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
            title="Экспорт журнала в JSON файл"
          >
            <Download className="w-4 h-4 text-cyber-cyan" />
            <span>Экспорт JSON</span>
          </button>

          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors ${loading ? 'animate-spin' : ''}`}
            title="Обновить журнал"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
            title="Очистить журнал аудита"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-white/10 bg-cosmic-900/50">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Всего событий</div>
            <ScrollText className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {logs.length}
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-white/10 bg-cosmic-900/50">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Генераций</div>
            <Sparkles className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {logs.filter((l) => l.action === 'generate').length}
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-white/10 bg-cosmic-900/50">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Сбросов HWID</div>
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {logs.filter((l) => l.action === 'reset_hwid').length}
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-white/10 bg-cosmic-900/50">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Блокировок</div>
            <Ban className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {logs.filter((l) => l.action === 'ban' || l.action === 'hwid_blacklist').length}
          </div>
        </GlassCard>
      </div>

      {/* Search and Action Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по ID, источнику, ключу или содержимому деталей..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-slate-500 text-xs focus:border-cyber-cyan/50 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block ml-1" />
          <div className="flex items-center gap-1.5 bg-white/[0.02] p-1 rounded-xl border border-white/10">
            {(
              [
                { id: 'all', label: 'Все' },
                { id: 'generate', label: 'Генерация' },
                { id: 'reset_hwid', label: 'HWID' },
                { id: 'status_change', label: 'Статус' },
                { id: 'hwid_blacklist', label: 'Бан' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  soundService.playTone('click');
                  setActionFilter(filter.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  actionFilter === filter.id
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <GlassCard className="p-0 border-white/10 bg-cosmic-900/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyber-cyan" />
            <span>Загрузка записей аудита...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
              <ScrollText className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-sm font-semibold text-white">Событий аудита не найдено</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || actionFilter !== 'all'
                ? 'Нет записей, соответствующих выбранным критериям поиска и фильтрации.'
                : 'Журнал аудита пуст. Все административные действия будут автоматически зафиксированы.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const BadgeIcon = badge.icon;
              const isExpanded = expandedLogIds.has(log.id);
              const summaryText = formatSummary(log);

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-white/[0.015] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Action badge & Summary */}
                    <div className="flex items-start sm:items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold uppercase border shrink-0 ${badge.className}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>

                      <div>
                        <div className="text-xs font-medium text-slate-100 font-sans leading-relaxed">
                          {summaryText}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(log.created_at).toLocaleString('ru-RU')}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Terminal className="w-3 h-3 text-slate-500" />
                            <span>{log.ip_or_source || 'Админ-панель'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-mono transition-colors flex items-center gap-1"
                        title="Развернуть JSON"
                      >
                        <Code className="w-3.5 h-3.5 text-cyber-cyan" />
                        <span>JSON</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyJson(log)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs transition-colors"
                        title="Скопировать запись"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded JSON details */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3.5 border-t border-white/10 animate-fadeIn">
                      <div className="relative rounded-xl bg-black/60 border border-white/10 p-3.5 font-mono text-xs text-cyber-cyan overflow-x-auto max-h-60">
                        <div className="absolute right-3 top-3 text-[10px] font-mono text-slate-500 uppercase">
                          Event ID: {log.id}
                        </div>
                        <pre className="text-[11px] text-slate-300 leading-relaxed font-mono">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
