-- ==============================================================================
-- Paradoxia Ecosystem - PostgreSQL Database Schema & Migration v3.5
-- Full Production Suite: Anti-Bruteforce, Admin RPCs, Telemetry, Anti-Spoofing & Maintenance
-- Target Database: Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. UTILITY & HELPER FUNCTIONS
-- ==============================================================================

-- 2.1 Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2.2 Helper: Safe internal audit logging
CREATE OR REPLACE FUNCTION public.log_internal_audit(
    p_action TEXT,
    p_details JSONB,
    p_ip_or_source TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (action, details, ip_or_source, created_at)
    VALUES (p_action, p_details, p_ip_or_source, now())
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Audit logging failure should not abort the parent business transaction
        RAISE WARNING 'Internal audit logging warning: %', SQLERRM;
        RETURN NULL;
END;
$$;

-- 2.3 Key Generator Helper: Format PRDX-XXXX-XXXX-XXXX or PDX-XXXX-XXXX-XXXX
CREATE OR REPLACE FUNCTION public.generate_license_key_string(p_prefix TEXT DEFAULT 'PRDX-')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    res TEXT := COALESCE(p_prefix, 'PRDX-');
    i INT;
    chunk INT;
BEGIN
    FOR chunk IN 1..3 LOOP
        FOR i IN 1..4 LOOP
            res := res || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
        END LOOP;
        IF chunk < 3 THEN
            res := res || '-';
        END IF;
    END LOOP;
    RETURN res;
END;
$$;

-- ==============================================================================
-- 3. CORE TABLES DEFINITION
-- ==============================================================================

-- 3.1 Licenses Table
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL DEFAULT 'Paradoxia',
    duration_days INTEGER NOT NULL CHECK (duration_days > 0), -- 9999 = Lifetime
    status TEXT NOT NULL CHECK (status IN ('unused', 'active', 'frozen', 'expired', 'banned')) DEFAULT 'unused',
    hwid TEXT NULL,
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL,
    -- Telemetry & Online Status
    last_seen_at TIMESTAMPTZ NULL,
    last_ip TEXT NULL,
    hwid_reset_count INTEGER NOT NULL DEFAULT 0
);

-- Ensure all columns exist for existing tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'licenses' AND column_name = 'last_seen_at') THEN
        ALTER TABLE public.licenses ADD COLUMN last_seen_at TIMESTAMPTZ NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'licenses' AND column_name = 'last_ip') THEN
        ALTER TABLE public.licenses ADD COLUMN last_ip TEXT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'licenses' AND column_name = 'hwid_reset_count') THEN
        ALTER TABLE public.licenses ADD COLUMN hwid_reset_count INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Trigger for licenses updated_at
DROP TRIGGER IF EXISTS trg_licenses_updated_at ON public.licenses;
CREATE TRIGGER trg_licenses_updated_at
    BEFORE UPDATE ON public.licenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3.2 App Settings & Global Service Status Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3.3 Audit / Activity Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_or_source TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 HWID Blacklist Table
CREATE TABLE IF NOT EXISTS public.hwid_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hwid TEXT UNIQUE NOT NULL,
    reason TEXT NULL,
    banned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5 Rate Limits Table (Anti-Bruteforce & Flood Protection)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT UNIQUE NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 1,
    locked_until TIMESTAMPTZ NULL,
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. PERFORMANCE & LOOKUP INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_licenses_key ON public.licenses(key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_hwid ON public.licenses(hwid);
CREATE INDEX IF NOT EXISTS idx_licenses_last_seen ON public.licenses(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON public.licenses(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_hwid_blacklist_hwid ON public.hwid_blacklist(hwid);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits(ip);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hwid_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 5.1 public.app_settings Policies
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role full access app_settings" ON public.app_settings;
CREATE POLICY "Service role full access app_settings" ON public.app_settings
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admin manage app_settings" ON public.app_settings;
CREATE POLICY "Authenticated admin manage app_settings" ON public.app_settings
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin') OR 
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') OR
        (auth.jwt() ->> 'email' LIKE '%@admin.paradoxia%')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role' = 'admin') OR 
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') OR
        (auth.jwt() ->> 'email' LIKE '%@admin.paradoxia%')
    );

-- 5.2 public.licenses Policies
DROP POLICY IF EXISTS "Service role full access licenses" ON public.licenses;
CREATE POLICY "Service role full access licenses" ON public.licenses
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admin manage licenses" ON public.licenses;
CREATE POLICY "Authenticated admin manage licenses" ON public.licenses
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin') OR 
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') OR
        (auth.jwt() ->> 'email' LIKE '%@admin.paradoxia%')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role' = 'admin') OR 
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') OR
        (auth.jwt() ->> 'email' LIKE '%@admin.paradoxia%')
    );

-- 5.3 public.audit_logs Policies
DROP POLICY IF EXISTS "Service role full access audit_logs" ON public.audit_logs;
CREATE POLICY "Service role full access audit_logs" ON public.audit_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admin view audit_logs" ON public.audit_logs;
CREATE POLICY "Authenticated admin view audit_logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin') OR 
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') OR
        (auth.jwt() ->> 'email' LIKE '%@admin.paradoxia%')
    );

-- 5.4 public.hwid_blacklist Policies
DROP POLICY IF EXISTS "Service role full access hwid_blacklist" ON public.hwid_blacklist;
CREATE POLICY "Service role full access hwid_blacklist" ON public.hwid_blacklist
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admin manage hwid_blacklist" ON public.hwid_blacklist;
CREATE POLICY "Authenticated admin manage hwid_blacklist" ON public.hwid_blacklist
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role' = 'admin') OR 
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') OR
        (auth.jwt() ->> 'email' LIKE '%@admin.paradoxia%')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role' = 'admin') OR 
        ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') OR
        (auth.jwt() ->> 'email' LIKE '%@admin.paradoxia%')
    );

-- 5.5 public.rate_limits Policies
DROP POLICY IF EXISTS "Service role full access rate_limits" ON public.rate_limits;
CREATE POLICY "Service role full access rate_limits" ON public.rate_limits
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 6. RATE LIMITING & SECURITY DEFENSES
-- ==============================================================================

-- 6.1 Check Rate Limit for an IP (default: max 5-10 failed attempts -> 15 min lock)
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
    p_ip TEXT,
    p_max_attempts INT DEFAULT 7,
    p_lock_minutes INT DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    rec RECORD;
BEGIN
    IF p_ip IS NULL OR TRIM(p_ip) = '' THEN
        RETURN true; -- Bypass if IP is unavailable
    END IF;

    SELECT * INTO rec FROM public.rate_limits WHERE ip = TRIM(p_ip);

    IF NOT FOUND THEN
        RETURN true;
    END IF;

    -- If currently locked
    IF rec.locked_until IS NOT NULL THEN
        IF rec.locked_until > now() THEN
            RETURN false; -- Still within lock duration
        ELSE
            -- Lock duration expired: clear record
            DELETE FROM public.rate_limits WHERE ip = TRIM(p_ip);
            RETURN true;
        END IF;
    END IF;

    -- If failed attempts threshold exceeded
    IF rec.failed_attempts >= p_max_attempts THEN
        UPDATE public.rate_limits
        SET locked_until = now() + (p_lock_minutes || ' minutes')::INTERVAL
        WHERE ip = TRIM(p_ip);
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- 6.2 Record Failed Attempt
CREATE OR REPLACE FUNCTION public.record_failed_rate_limit_attempt(
    p_ip TEXT,
    p_max_attempts INT DEFAULT 7,
    p_lock_minutes INT DEFAULT 15
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_ip IS NULL OR TRIM(p_ip) = '' THEN
        RETURN;
    END IF;

    INSERT INTO public.rate_limits (ip, failed_attempts, last_attempt_at)
    VALUES (TRIM(p_ip), 1, now())
    ON CONFLICT (ip) DO UPDATE
    SET 
        failed_attempts = public.rate_limits.failed_attempts + 1,
        last_attempt_at = now(),
        locked_until = CASE 
            WHEN public.rate_limits.failed_attempts + 1 >= p_max_attempts 
            THEN now() + (p_lock_minutes || ' minutes')::INTERVAL
            ELSE public.rate_limits.locked_until
        END;
END;
$$;

-- 6.3 Reset Rate Limit after Successful Validation
CREATE OR REPLACE FUNCTION public.reset_ip_rate_limit(p_ip TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_ip IS NOT NULL AND TRIM(p_ip) <> '' THEN
        DELETE FROM public.rate_limits WHERE ip = TRIM(p_ip);
    END IF;
END;
$$;

-- 6.4 Generate Cryptographic HMAC-SHA256 Signature for Anti-Spoofing / Anti-MITM
CREATE OR REPLACE FUNCTION public.sign_payload(p_payload TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_secret TEXT;
BEGIN
    -- Fetch signature secret from app_settings
    SELECT value ->> 'secret_salt' INTO v_secret 
    FROM public.app_settings 
    WHERE key = 'security_keys';

    IF v_secret IS NULL OR v_secret = '' THEN
        v_secret := 'PRDX_SEC_SALT_9918274_STABLE';
    END IF;

    RETURN encode(hmac(p_payload::bytea, v_secret::bytea, 'sha256'), 'hex');
END;
$$;

-- ==============================================================================
-- 7. CLIENT RPC FUNCTIONS (PUBLIC API / CLIENT SOFTWARE)
-- ==============================================================================

-- 7.1 Public License Status Check
CREATE OR REPLACE FUNCTION public.check_license(
    p_key TEXT,
    p_hwid TEXT DEFAULT NULL,
    p_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    lic RECORD;
    is_hwid_banned BOOLEAN := false;
    hwid_mismatch BOOLEAN := false;
    sanitized_key TEXT;
    sanitized_hwid TEXT;
    payload_str TEXT;
    v_signature TEXT;
BEGIN
    -- 1. Anti-Bruteforce Rate Limit Check
    IF NOT public.check_ip_rate_limit(p_ip) THEN
        PERFORM public.log_internal_audit(
            'rate_limit_blocked',
            jsonb_build_object('ip', p_ip, 'attempted_key', p_key),
            p_ip
        );
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'rate_limited',
            'message', 'Слишком много неудачных попыток. Доступ временно заблокирован на 15 минут.'
        );
    END IF;

    sanitized_key := UPPER(TRIM(p_key));
    IF p_hwid IS NOT NULL THEN
        sanitized_hwid := TRIM(p_hwid);
    END IF;

    IF sanitized_key IS NULL OR sanitized_key = '' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'error',
            'message', 'Ключ не может быть пустым'
        );
    END IF;

    SELECT * INTO lic FROM public.licenses WHERE key = sanitized_key;

    IF NOT FOUND THEN
        PERFORM public.record_failed_rate_limit_attempt(p_ip);
        PERFORM public.log_internal_audit(
            'check_failed',
            jsonb_build_object('key', sanitized_key, 'reason', 'not_found', 'hwid', sanitized_hwid),
            p_ip
        );
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'not_found',
            'message', 'Лицензионный ключ не найден. Проверьте правильность ввода формата PRDX-XXXX-XXXX-XXXX.'
        );
    END IF;

    -- Check if bound HWID is blacklisted
    IF lic.hwid IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM public.hwid_blacklist WHERE hwid = lic.hwid) INTO is_hwid_banned;
        IF is_hwid_banned THEN
            RETURN jsonb_build_object(
                'valid', false,
                'status', 'banned',
                'message', 'Аппаратный идентификатор (HWID), связанный с данным ключом, заблокирован в системе защиты.'
            );
        END IF;
    END IF;

    -- Check if incoming client HWID is blacklisted
    IF sanitized_hwid IS NOT NULL AND sanitized_hwid <> '' THEN
        SELECT EXISTS(SELECT 1 FROM public.hwid_blacklist WHERE hwid = sanitized_hwid) INTO is_hwid_banned;
        IF is_hwid_banned THEN
            RETURN jsonb_build_object(
                'valid', false,
                'status', 'banned',
                'message', 'Ваше устройство (HWID) заблокировано в системе защиты.'
            );
        END IF;

        -- Verify HWID match if license is already bound
        IF lic.hwid IS NOT NULL AND lic.hwid <> sanitized_hwid THEN
            hwid_mismatch := true;
        END IF;
    END IF;

    -- Check status and expiration
    IF lic.status = 'active' AND lic.expires_at IS NOT NULL AND lic.expires_at < now() THEN
        UPDATE public.licenses 
        SET status = 'expired', updated_at = now() 
        WHERE id = lic.id;
        
        lic.status := 'expired';
        PERFORM public.log_internal_audit(
            'auto_expired',
            jsonb_build_object('license_id', lic.id, 'key', lic.key),
            p_ip
        );
    END IF;

    -- Update last seen telemetry
    UPDATE public.licenses
    SET 
        last_seen_at = now(),
        last_ip = COALESCE(p_ip, last_ip)
    WHERE id = lic.id;

    -- Reset rate limit counter on valid lookup
    PERFORM public.reset_ip_rate_limit(p_ip);

    -- Status validation logic
    IF lic.status = 'banned' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'banned',
            'message', 'Данная лицензия заблокирована администрацией.'
        );
    ELSIF lic.status = 'frozen' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'frozen',
            'message', 'Действие лицензии временно заморожено.'
        );
    ELSIF lic.status = 'expired' THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'expired',
            'message', 'Срок действия лицензии истек.'
        );
    END IF;

    IF hwid_mismatch THEN
        RETURN jsonb_build_object(
            'valid', false,
            'status', 'hwid_mismatch',
            'hwid_bound', true,
            'message', 'Лицензия уже привязана к другому оборудованию. Обратитесь в поддержку для сброса HWID.'
        );
    END IF;

    -- Generate cryptographic verification signature for client anti-tamper validation
    payload_str := lic.key || ':' || lic.status || ':' || COALESCE(lic.hwid, 'none') || ':' || COALESCE(lic.expires_at::TEXT, 'lifetime');
    v_signature := public.sign_payload(payload_str);

    RETURN jsonb_build_object(
        'valid', true,
        'key', lic.key,
        'product_name', lic.product_name,
        'status', lic.status,
        'duration_days', lic.duration_days,
        'hwid_bound', (lic.hwid IS NOT NULL),
        'created_at', lic.created_at,
        'activated_at', lic.activated_at,
        'expires_at', lic.expires_at,
        'last_seen_at', now(),
        'signature', v_signature,
        'response_signature', v_signature
    );
END;
$$;

-- 7.2 Public License Activation with HWID Binding
CREATE OR REPLACE FUNCTION public.activate_license(
    p_key TEXT,
    p_hwid TEXT,
    p_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    lic RECORD;
    sanitized_key TEXT;
    sanitized_hwid TEXT;
    is_hwid_banned BOOLEAN := false;
    v_new_expires_at TIMESTAMPTZ;
    payload_str TEXT;
    v_signature TEXT;
BEGIN
    -- Rate limit check
    IF NOT public.check_ip_rate_limit(p_ip) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Слишком много попыток. Подождите перед повторной активацией.'
        );
    END IF;

    sanitized_key := UPPER(TRIM(p_key));
    sanitized_hwid := TRIM(p_hwid);

    IF sanitized_key IS NULL OR sanitized_key = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Лицензионный ключ не может быть пустым');
    END IF;

    IF sanitized_hwid IS NULL OR sanitized_hwid = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'HWID оборудования обязателен для активации');
    END IF;

    -- Check if hardware ID is in blacklist
    SELECT EXISTS(SELECT 1 FROM public.hwid_blacklist WHERE hwid = sanitized_hwid) INTO is_hwid_banned;
    IF is_hwid_banned THEN
        PERFORM public.log_internal_audit(
            'activation_rejected_banned_hwid',
            jsonb_build_object('key', sanitized_key, 'hwid', sanitized_hwid),
            p_ip
        );
        RETURN jsonb_build_object('success', false, 'message', 'Данное устройство заблокировано в системе защиты');
    END IF;

    -- Lock record for update to prevent race conditions
    SELECT * INTO lic FROM public.licenses WHERE key = sanitized_key FOR UPDATE;

    IF NOT FOUND THEN
        PERFORM public.record_failed_rate_limit_attempt(p_ip);
        PERFORM public.log_internal_audit(
            'activation_not_found',
            jsonb_build_object('key', sanitized_key, 'hwid', sanitized_hwid),
            p_ip
        );
        RETURN jsonb_build_object('success', false, 'message', 'Лицензионный ключ не найден');
    END IF;

    -- Status verification
    IF lic.status = 'banned' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Лицензия заблокирована');
    END IF;

    IF lic.status = 'frozen' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Лицензия временно заморожена');
    END IF;

    -- If already active
    IF lic.status = 'active' THEN
        IF lic.expires_at IS NOT NULL AND lic.expires_at < now() THEN
            UPDATE public.licenses SET status = 'expired', updated_at = now() WHERE id = lic.id;
            RETURN jsonb_build_object('success', false, 'message', 'Срок действия лицензии истек');
        END IF;

        IF lic.hwid = sanitized_hwid THEN
            -- Idempotent re-check from the same machine
            payload_str := lic.key || ':active:' || sanitized_hwid || ':' || COALESCE(lic.expires_at::TEXT, 'lifetime');
            v_signature := public.sign_payload(payload_str);

            UPDATE public.licenses 
            SET last_seen_at = now(), last_ip = COALESCE(p_ip, last_ip) 
            WHERE id = lic.id;

            RETURN jsonb_build_object(
                'success', true,
                'message', 'Сессия подтверждена (устройство уже активировано)',
                'key', lic.key,
                'product_name', lic.product_name,
                'status', lic.status,
                'activated_at', lic.activated_at,
                'expires_at', lic.expires_at,
                'signature', v_signature,
                'response_signature', v_signature
            );
        ELSE
            PERFORM public.record_failed_rate_limit_attempt(p_ip);
            PERFORM public.log_internal_audit(
                'hwid_mismatch_attempt',
                jsonb_build_object('key', lic.key, 'current_hwid', lic.hwid, 'attempt_hwid', sanitized_hwid),
                p_ip
            );
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Ключ уже привязан к другому устройству. Обратитесь в поддержку для сброса HWID.'
            );
        END IF;
    END IF;

    IF lic.status = 'expired' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Срок действия лицензии истек');
    END IF;

    IF lic.status <> 'unused' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Недопустимый статус лицензии для активации');
    END IF;

    -- Expiration calculation (9999 = Lifetime)
    IF lic.duration_days >= 9999 THEN
        v_new_expires_at := NULL;
    ELSE
        v_new_expires_at := now() + (lic.duration_days || ' days')::INTERVAL;
    END IF;

    -- Update license record
    UPDATE public.licenses
    SET 
        status = 'active',
        hwid = sanitized_hwid,
        activated_at = now(),
        expires_at = v_new_expires_at,
        last_seen_at = now(),
        last_ip = COALESCE(p_ip, last_ip)
    WHERE id = lic.id;

    -- Log audit
    PERFORM public.log_internal_audit(
        'activate',
        jsonb_build_object(
            'license_id', lic.id,
            'key', lic.key,
            'hwid', sanitized_hwid,
            'duration_days', lic.duration_days,
            'expires_at', v_new_expires_at
        ),
        p_ip
    );

    PERFORM public.reset_ip_rate_limit(p_ip);

    payload_str := lic.key || ':active:' || sanitized_hwid || ':' || COALESCE(v_new_expires_at::TEXT, 'lifetime');
    v_signature := public.sign_payload(payload_str);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Лицензия успешно активирована!',
        'key', lic.key,
        'product_name', lic.product_name,
        'status', 'active',
        'duration_days', lic.duration_days,
        'hwid', sanitized_hwid,
        'activated_at', now(),
        'expires_at', v_new_expires_at,
        'signature', v_signature,
        'response_signature', v_signature
    );
END;
$$;

-- 7.3 Telemetry & Online Status Heartbeat RPC
CREATE OR REPLACE FUNCTION public.heartbeat_license(
    p_key TEXT,
    p_hwid TEXT,
    p_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    lic RECORD;
    sanitized_key TEXT := UPPER(TRIM(p_key));
    sanitized_hwid TEXT := TRIM(p_hwid);
    v_signature TEXT;
    payload_str TEXT;
BEGIN
    SELECT id, key, status, hwid, expires_at INTO lic
    FROM public.licenses
    WHERE key = sanitized_key;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('alive', false, 'reason', 'not_found');
    END IF;

    IF lic.status <> 'active' THEN
        RETURN jsonb_build_object('alive', false, 'status', lic.status, 'reason', 'inactive');
    END IF;

    IF lic.hwid IS DISTINCT FROM sanitized_hwid THEN
        RETURN jsonb_build_object('alive', false, 'reason', 'hwid_mismatch');
    END IF;

    IF lic.expires_at IS NOT NULL AND lic.expires_at < now() THEN
        UPDATE public.licenses SET status = 'expired', updated_at = now() WHERE id = lic.id;
        RETURN jsonb_build_object('alive', false, 'status', 'expired');
    END IF;

    UPDATE public.licenses
    SET last_seen_at = now(), last_ip = COALESCE(p_ip, last_ip), updated_at = now()
    WHERE id = lic.id;

    payload_str := lic.key || ':alive:' || sanitized_hwid || ':' || (extract(epoch from now())::bigint / 300);
    v_signature := public.sign_payload(payload_str);

    RETURN jsonb_build_object(
        'alive', true, 
        'last_seen_at', now(),
        'signature', v_signature,
        'response_signature', v_signature
    );
END;
$$;

-- ==============================================================================
-- 8. ADMINISTRATIVE RPC FUNCTIONS (DASHBOARD & MANAGEMENT API)
-- ==============================================================================

-- 8.1 Admin HWID Reset with Audit Logging
CREATE OR REPLACE FUNCTION public.admin_reset_hwid(
    p_license_id UUID,
    p_reason TEXT DEFAULT NULL,
    p_admin_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    lic RECORD;
    v_new_reset_count INT;
BEGIN
    SELECT * INTO lic FROM public.licenses WHERE id = p_license_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Лицензия не найдена');
    END IF;

    v_new_reset_count := COALESCE(lic.hwid_reset_count, 0) + 1;

    UPDATE public.licenses
    SET 
        hwid = NULL,
        hwid_reset_count = v_new_reset_count,
        updated_at = now()
    WHERE id = lic.id;

    PERFORM public.log_internal_audit(
        'reset_hwid',
        jsonb_build_object(
            'license_id', lic.id,
            'key', lic.key,
            'previous_hwid', lic.hwid,
            'reset_count', v_new_reset_count,
            'reason', COALESCE(p_reason, 'Сброс через панель управления')
        ),
        p_admin_ip
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'HWID успешно сброшен',
        'license_id', lic.id,
        'key', lic.key,
        'reset_count', v_new_reset_count
    );
END;
$$;

-- 8.2 Admin Bulk Actions (Freeze, Unfreeze, Ban, Reset HWID, Extend 7d/30d, Delete)
CREATE OR REPLACE FUNCTION public.admin_bulk_action(
    p_license_ids UUID[],
    p_action TEXT,
    p_reason TEXT DEFAULT NULL,
    p_admin_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_affected INT := 0;
BEGIN
    IF p_license_ids IS NULL OR array_length(p_license_ids, 1) = 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Список ID пуст');
    END IF;

    IF p_action = 'freeze' THEN
        UPDATE public.licenses
        SET status = 'frozen', updated_at = now()
        WHERE id = ANY(p_license_ids) AND status = 'active';
        GET DIAGNOSTICS v_affected = ROW_COUNT;

    ELSIF p_action = 'unfreeze' THEN
        UPDATE public.licenses
        SET status = 'active', updated_at = now()
        WHERE id = ANY(p_license_ids) AND status = 'frozen';
        GET DIAGNOSTICS v_affected = ROW_COUNT;

    ELSIF p_action = 'ban' THEN
        UPDATE public.licenses
        SET status = 'banned', updated_at = now()
        WHERE id = ANY(p_license_ids);
        GET DIAGNOSTICS v_affected = ROW_COUNT;

    ELSIF p_action = 'reset_hwid' THEN
        UPDATE public.licenses
        SET hwid = NULL, hwid_reset_count = COALESCE(hwid_reset_count, 0) + 1, updated_at = now()
        WHERE id = ANY(p_license_ids);
        GET DIAGNOSTICS v_affected = ROW_COUNT;

    ELSIF p_action = 'extend_7d' THEN
        UPDATE public.licenses
        SET 
            expires_at = GREATEST(COALESCE(expires_at, now()), now()) + INTERVAL '7 days',
            status = CASE WHEN status = 'expired' THEN 'active' ELSE status END,
            updated_at = now()
        WHERE id = ANY(p_license_ids) AND (expires_at IS NOT NULL OR status = 'expired');
        GET DIAGNOSTICS v_affected = ROW_COUNT;

    ELSIF p_action = 'extend_30d' THEN
        UPDATE public.licenses
        SET 
            expires_at = GREATEST(COALESCE(expires_at, now()), now()) + INTERVAL '30 days',
            status = CASE WHEN status = 'expired' THEN 'active' ELSE status END,
            updated_at = now()
        WHERE id = ANY(p_license_ids) AND (expires_at IS NOT NULL OR status = 'expired');
        GET DIAGNOSTICS v_affected = ROW_COUNT;

    ELSIF p_action = 'delete' THEN
        DELETE FROM public.licenses
        WHERE id = ANY(p_license_ids);
        GET DIAGNOSTICS v_affected = ROW_COUNT;

    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Неизвестное действие: ' || p_action);
    END IF;

    PERFORM public.log_internal_audit(
        CASE WHEN p_action = 'delete' THEN 'delete' ELSE 'status_change' END,
        jsonb_build_object(
            'action', p_action,
            'affected_count', v_affected,
            'ids', p_license_ids,
            'reason', p_reason
        ),
        p_admin_ip
    );

    RETURN jsonb_build_object(
        'success', true,
        'action', p_action,
        'affected_count', v_affected
    );
END;
$$;

-- 8.3 Admin Batch License Generator (Format: PRDX-XXXX-XXXX-XXXX)
CREATE OR REPLACE FUNCTION public.admin_generate_licenses(
    p_count INT,
    p_duration_days INT,
    p_note TEXT DEFAULT NULL,
    p_product TEXT DEFAULT 'Paradoxia',
    p_admin_ip TEXT DEFAULT NULL,
    p_prefix TEXT DEFAULT 'PRDX-'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    i INT;
    generated_keys TEXT[] := '{}';
    new_key TEXT;
    v_inserted INT := 0;
BEGIN
    IF p_count <= 0 OR p_count > 1000 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Количество должно быть от 1 до 1000');
    END IF;

    IF p_duration_days <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Срок действия должен быть больше 0 дней');
    END IF;

    FOR i IN 1..p_count LOOP
        -- Generate collision-free unique key
        LOOP
            new_key := public.generate_license_key_string(COALESCE(p_prefix, 'PRDX-'));
            EXIT WHEN NOT EXISTS(SELECT 1 FROM public.licenses WHERE key = new_key);
        END LOOP;

        INSERT INTO public.licenses (
            key,
            product_name,
            duration_days,
            status,
            note,
            created_at,
            updated_at
        ) VALUES (
            new_key,
            COALESCE(p_product, 'Paradoxia'),
            p_duration_days,
            'unused',
            p_note,
            now(),
            now()
        );

        generated_keys := array_append(generated_keys, new_key);
        v_inserted := v_inserted + 1;
    END LOOP;

    PERFORM public.log_internal_audit(
        'generate',
        jsonb_build_object(
            'count', v_inserted,
            'duration_days', p_duration_days,
            'product_name', p_product,
            'note', p_note,
            'keys_sample', generated_keys[1:5]
        ),
        p_admin_ip
    );

    RETURN jsonb_build_object(
        'success', true,
        'count', v_inserted,
        'duration_days', p_duration_days,
        'keys', generated_keys
    );
END;
$$;

-- ==============================================================================
-- 9. AUTOMATED MAINTENANCE & CRON FUNCTIONS
-- ==============================================================================

-- 9.1 Periodic cleanup of expired active licenses (Run via pg_cron or server task)
CREATE OR REPLACE FUNCTION public.expire_licenses_cron()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated INT;
BEGIN
    UPDATE public.licenses
    SET status = 'expired', updated_at = now()
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < now();

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    
    IF v_updated > 0 THEN
        PERFORM public.log_internal_audit(
            'cron_expire',
            jsonb_build_object('expired_count', v_updated),
            'system_cron'
        );
    END IF;

    RETURN v_updated;
END;
$$;

-- 9.2 System Data Retention Cleanup (Stale rate limits and legacy audit logs)
CREATE OR REPLACE FUNCTION public.cleanup_system_data(
    p_audit_retention_days INT DEFAULT 90
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_rate_limits INT;
    v_deleted_audit INT;
BEGIN
    -- Delete rate limit locks that have already expired or are older than 2 hours
    DELETE FROM public.rate_limits
    WHERE last_attempt_at < now() - INTERVAL '2 hours'
      AND (locked_until IS NULL OR locked_until < now());
    GET DIAGNOSTICS v_deleted_rate_limits = ROW_COUNT;

    -- Delete audit logs older than retention period
    DELETE FROM public.audit_logs
    WHERE created_at < now() - (p_audit_retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS v_deleted_audit = ROW_COUNT;

    RETURN jsonb_build_object(
        'deleted_rate_limits', v_deleted_rate_limits,
        'deleted_audit_logs', v_deleted_audit
    );
END;
$$;

-- ==============================================================================
-- 10. SEED CONFIGURATION & SECURITY CREDENTIALS
-- ==============================================================================

-- 10.1 Default Service Status
INSERT INTO public.app_settings (key, value)
VALUES (
    'service_status',
    jsonb_build_object(
        'status', 'UNDETECTED',
        'version', 'v3.4.2-STABLE',
        'broadcast_message', 'Все защитные алгоритмы активны. Обновление протокола успешно завершено.',
        'banner_active', true,
        'last_updated', now()
    )
)
ON CONFLICT (key) DO NOTHING;

-- 10.2 Cryptographic Salt for HMAC Signatures
INSERT INTO public.app_settings (key, value)
VALUES (
    'security_keys',
    jsonb_build_object(
        'secret_salt', encode(gen_random_bytes(32), 'hex'),
        'created_at', now()
    )
)
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 11. RPC ACCESS GRANTS & PRIVILEGES
-- ==============================================================================

GRANT EXECUTE ON FUNCTION public.check_license(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.activate_license(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.heartbeat_license(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_reset_hwid(UUID, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_bulk_action(UUID[], TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_generate_licenses(INT, INT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.expire_licenses_cron() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_system_data(INT) TO authenticated, service_role;
