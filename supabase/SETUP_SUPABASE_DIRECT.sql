-- ==============================================================================
-- PARADOXIA ECOSYSTEM - ONE-CLICK SUPABASE SETUP & PERMISSIONS
-- Вставьте этот скрипт в Supabase SQL Editor (SQL Editor -> New query -> Run)
-- Создает/синхронизирует все таблицы и полностью открывает доступ (RLS Disabled).
-- ==============================================================================

-- 1. Таблица licenses (Лицензионные ключи)
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL DEFAULT 'Paradoxia',
    duration_days INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'unused',
    hwid TEXT NULL,
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL,
    last_seen_at TIMESTAMPTZ NULL,
    last_ip TEXT NULL,
    hwid_reset_count INTEGER NOT NULL DEFAULT 0
);

-- Индекс для быстрого поиска ключа
CREATE INDEX IF NOT EXISTS idx_licenses_key ON public.licenses (key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses (status);

-- 2. Таблица app_settings (Глобальные настройки и статус чита)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Инициализируем статус чита по умолчанию, если записи нет
INSERT INTO public.app_settings (key, value, updated_at)
VALUES (
    'global_status',
    jsonb_build_object(
        'status', 'UNDETECTED',
        'version', 'v3.4.2-STABLE',
        'broadcast_message', 'Все модули обхода античита работают в штатном режиме. Системы защиты стабильны.',
        'banner_active', true,
        'last_updated', now()
    ),
    now()
)
ON CONFLICT (key) DO NOTHING;

-- 3. Таблица hwid_blacklist (Черный список аппаратных идентификаторов)
CREATE TABLE IF NOT EXISTS public.hwid_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hwid TEXT UNIQUE NOT NULL,
    reason TEXT NULL,
    banned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hwid_blacklist_hwid ON public.hwid_blacklist (hwid);

-- 4. Таблица audit_logs (Журнал аудита действий администрации)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_or_source TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

-- 5. Таблица rate_limits (Защита от подбора ключей / brute-force)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 1,
    locked_until TIMESTAMPTZ NULL,
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits (ip);

-- ==============================================================================
-- БЕЗОПАСНОСТЬ: ОТКЛЮЧЕНИЕ RLS И ВЫДАЧА ПРАВ
-- Гарантирует корректную работу фронтенда через anon ключ без блокировок RLS
-- ==============================================================================

ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hwid_blacklist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.licenses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.app_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.hwid_blacklist TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.rate_limits TO anon, authenticated, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
