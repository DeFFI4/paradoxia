-- ==============================================================================
-- Paradoxia Ecosystem - Migration 002: Permissions & Direct Access for Admin Panel
-- Запустите этот скрипт в Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- для моментального открытия прав на запись, редактирование и чтение ключей.
-- ==============================================================================

-- 1. Таблица лицензий: разрешить все операции (SELECT, INSERT, UPDATE, DELETE)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to licenses for admin panel" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon full access licenses" ON public.licenses;
DROP POLICY IF EXISTS "Authenticated admin manage licenses" ON public.licenses;
DROP POLICY IF EXISTS "Service role full access licenses" ON public.licenses;

CREATE POLICY "Allow all access to licenses for admin panel" ON public.licenses
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- 2. Журнал аудита (audit_logs)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated admin view audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role full access audit_logs" ON public.audit_logs;

CREATE POLICY "Allow all access to audit_logs" ON public.audit_logs
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- 3. Настройки системы (app_settings)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Authenticated admin manage app_settings" ON public.app_settings;

CREATE POLICY "Allow all access to app_settings" ON public.app_settings
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- 4. Черный список HWID (hwid_blacklist)
ALTER TABLE public.hwid_blacklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to hwid_blacklist" ON public.hwid_blacklist;
DROP POLICY IF EXISTS "Authenticated admin manage hwid_blacklist" ON public.hwid_blacklist;
DROP POLICY IF EXISTS "Service role full access hwid_blacklist" ON public.hwid_blacklist;

CREATE POLICY "Allow all access to hwid_blacklist" ON public.hwid_blacklist
    FOR ALL
    TO anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- 5. Прямые привилегии на таблицы для anon, authenticated и service_role
GRANT ALL ON TABLE public.licenses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_logs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.app_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.hwid_blacklist TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.rate_limits TO anon, authenticated, service_role;

-- 6. Права на вызовы RPC-функций
GRANT EXECUTE ON FUNCTION public.check_license(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.activate_license(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.heartbeat_license(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_reset_hwid(UUID, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_bulk_action(UUID[], TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_generate_licenses(INT, INT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_internal_audit(TEXT, JSONB, TEXT) TO anon, authenticated, service_role;

-- Дополнительная гарантия прав на все функции и последовательности схемы public
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

