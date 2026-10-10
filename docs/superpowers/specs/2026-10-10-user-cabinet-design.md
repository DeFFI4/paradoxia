# Paradoxia: Personal User Cabinet & Wallet Architecture Spec

## 1. Executive Summary & Goals
The objective is to introduce an enterprise-grade, cyberpunk-themed **Personal User Cabinet (`UserDashboard`)** for Paradoxia customers.
The personal cabinet enables users to:
1. **Subscription Management**: View and manage active subscription(s) with real-time countdown, status badge, freeze/unfreeze, and extend capabilities.
2. **HWID Hardware Management**: View HWID binding hash, initiate Hardware ID reset with cooldown validation (7-day cycle) or emergency bypass via email verification.
3. **Internal Balance / Wallet ("балик")**: Manage internal balance in RUB (₽), top up via simulated/Platega gateway, pay/renew subscriptions directly from balance, and view full transaction audit log.
4. **Security & Profile Settings ("только по защитной ссылке на почту")**:
   - **Смена почты (Change Email)**: Запрос новой почты -> отправка подтверждающей ссылки на текущую почту -> подтверждение по ссылке -> смена почты.
   - **Смена пароля (Change Password)**: Запрос изменения пароля -> подтверждение по криптографической ссылке на почту -> установка нового пароля.
   - **Привязка/отвязка Telegram**: Привязка Telegram-аккаунта (@username / Chat ID) для уведомлений -> валидация через ссылку на почту.
   - **Экстренное завершение всех сессий (Panic Button / Revoke All Sessions)**: Отзыв всех авторизованных сессий и токенов на других устройствах при подтверждении по почте.
   - **Экстренный сброс HWID (Emergency HWID Reset)**: Сброс привязки железа в обход обычного 7-дневного кулдауна через ссылку безопасности на почту.
   - **Двухфакторная аутентификация (2FA)**: Включение и отключение 2FA для входа в кабинет через ссылку подтверждения.
   - **Удаление аккаунта (Delete Account / GDPR)**: Полная деактивация и удаление профиля и данных только после явного подтверждения по почте.
5. **Interactive Email Dispatcher ("Cyberpunk Email Dispatcher Modal")**:
   - Специальное интерактивное окно эмулятора почтового сервиса безопасности прямо в UI: отображает тему письма, маскированный адрес, одноразовый защитный токен с таймером жизни 15 минут, кнопку перехода по ссылке и возможность перехода через URL-параметр `?security_token=...`.
6. **Software Distribution**: Защищенная загрузка актуального лоадера (`ParadoxiaLoader_v2.4.exe`) с генерацией динамического одноразового токена запуска и пошаговой инструкцией.
7. **Authentication & Identity**: Вход по Email/паролю, моментальный вход по ключу лицензии (PDX Key), и 1-клик демонстрационный доступ.

---

## 2. Visual & Interaction Standards
- **Strict Vector Icons**: Исключительно иконки `lucide-react` (`User`, `Wallet`, `KeyRound`, `Cpu`, `Clock`, `ShieldCheck`, `ShieldAlert`, `Download`, `RefreshCw`, `ArrowUpRight`, `Lock`, `Snowflake`, `PlusCircle`, `LogOut`, `Mail`, `Send`, `Smartphone`, `CheckCircle2`, `AlertCircle`, `Trash2`, `ExternalLink`, etc.). Строго **0 эмодзи** в интерфейсе.
- **Aesthetic**:
  - Cosmic Obsidian background (`#060609` / `bg-cosmic-950`).
  - Frosted liquid glass card modules (`backdrop-blur-2xl`, `bg-white/[0.03]`, `border border-white/10`).
  - Neon accents in Cyber Cyan (`#06b6d4`), Cyber Violet (`#8b5cf6`), Amber/Warning (`#f59e0b`), и Crimson/Danger (`#ef4444`).
  - Тактильная звуковая обратная связь через `soundService`.

---

## 3. Data Models & State Architecture

### 3.1 Data Types (`src/types/user.ts`)
```typescript
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  balance: number; // in RUB (e.g. 1450)
  role: 'user' | 'vip' | 'reseller' | 'admin';
  telegram_username?: string | null;
  telegram_id?: string | null;
  two_factor_enabled: boolean;
  email_verified: boolean;
  created_at: string;
  avatar_url?: string;
  last_login_ip?: string;
  last_login_at?: string;
}

export type TransactionType = 'topup' | 'purchase' | 'extend' | 'hwid_reset_fee';

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface UserSubscription {
  license_id: string;
  key: string;
  product_name: string;
  duration_days: number;
  status: 'active' | 'frozen' | 'expired';
  activated_at: string;
  expires_at: string;
  hwid: string | null;
  hwid_reset_count: number;
  last_hwid_reset_at?: string | null;
  can_reset_hwid: boolean;
  hwid_cooldown_hours_left: number;
}

export interface UserSession {
  id: string;
  user_id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  last_active: string;
  is_current: boolean;
}

export type SecurityActionType =
  | 'change_email'
  | 'change_password'
  | 'bind_telegram'
  | 'unbind_telegram'
  | 'revoke_all_sessions'
  | 'emergency_hwid_reset'
  | 'toggle_2fa'
  | 'delete_account';

export interface SecurityActionRequest {
  id: string;
  user_id: string;
  action_type: SecurityActionType;
  payload: Record<string, any>;
  token: string;
  target_email: string;
  created_at: string;
  expires_at: string; // 15 mins TTL
  confirmed: boolean;
}
```

### 3.2 Service Layer (`src/services/userService.ts`)
- **Authentication**:
  - `getCurrentUser(): UserProfile | null`
  - `loginWithEmail(email: string, pass: string): Promise<UserProfile>`
  - `loginWithKey(key: string): Promise<UserProfile>`
  - `demoLogin(): Promise<UserProfile>`
  - `logout(): void`
- **Wallet & Balance**:
  - `topUpBalance(userId: string, amount: number, method: string): Promise<WalletTransaction>`
  - `renewSubscription(userId: string, licenseId: string, days: number, cost: number): Promise<boolean>`
  - `getTransactionHistory(userId: string): Promise<WalletTransaction[]>`
- **Subscriptions & HWID**:
  - `getUserSubscriptions(userId: string): Promise<UserSubscription[]>`
  - `freezeSubscription(userId: string, licenseId: string): Promise<boolean>`
  - `resetHwid(userId: string, licenseId: string): Promise<{ success: boolean; message: string }>`
- **Security Actions (Email Link Protected)**:
  - `requestSecurityAction(userId: string, actionType: SecurityActionType, payload: Record<string, any>): Promise<SecurityActionRequest>`
  - `getPendingSecurityAction(token: string): SecurityActionRequest | null`
  - `confirmSecurityAction(token: string): Promise<{ success: boolean; message: string }>`
  - `getUserSessions(userId: string): UserSession[]`
  - `revokeSession(userId: string, sessionId: string): Promise<boolean>`

Persistence:
1. Supabase таблицы (`user_profiles`, `user_transactions`, `user_security_tokens`) при подключении ключей.
2. `localStorage` fallback (`pdx_user_profiles`, `pdx_user_session`, `pdx_user_transactions`, `pdx_security_actions`) со стартовыми демо-данными для надежной автономной работы без сторонних зависимостей.

---

## 4. UI Architecture & Components

```
src/components/cabinet/
├── UserCabinetView.tsx         # Главный контейнер ЛК с навигацией по вкладкам и виджетом профиля
├── OverviewTab.tsx             # Сводка: статус подписки, таймер, быстрый баланс, кнопка скачивания лоадера
├── SubscriptionsTab.tsx        # Детальный список подписок, продление с баланса со скидкой, заморозка
├── HwidManagerTab.tsx          # Статус HWID, таймер кулдауна, сброс (стандартный и экстренный)
├── WalletTab.tsx               # Управление балансом, история транзакций, пресеты пополнения
├── SecuritySettingsTab.tsx     # Центр безопасности: почта, пароль, Telegram, 2FA, сессии, Panic button, удаление
├── TopUpModal.tsx              # Модальное окно пополнения баланса (пресеты 250₽, 500₽, 1000₽, 2500₽, кастом)
├── EmailDispatcherModal.tsx    # Cyberpunk Mail Simulator: интерактивное окно защитного письма со ссылкой и токеном
└── AuthModal.tsx               # Модальное окно авторизации (Email/Пароль, Direct Key, 1-Click Demo)
```

### 4.1 Вкладки Личного Кабинета
1. **Обзор (Overview)**: Баланс кошелька, активный продукт с таймером окончания, статус HWID, быстрое скачивание лоадера с генерацией токена, уровень безопасности аккаунта.
2. **Подписки (Subscriptions)**: Все активированные ключи, оставшееся время, кнопка «Продлить со скидкой с баланса», кнопка заморозки/разморозки.
3. **Управление HWID**: Текущий хэш привязки, статус валидации, 7-дневный кулдаун, кнопка безопасного сброса + кнопка «Экстренный сброс через подтверждение по почте».
4. **Кошелек (Wallet)**: Баланс, быстрые кнопки пополнения, детальная таблица истории транзакций со статусами и фильтрацией.
5. **Безопасность (Security & Settings)**:
   - Смена почты (ввод нового адреса -> письмо со ссылкой на старую почту)
   - Смена пароля (запрос смены -> ссылка безопасности на почту -> форма нового пароля)
   - Telegram связка (ввод юзернейма -> подтверждение ссылки на почту -> статус привязан)
   - Двухфакторная защита (2FA переключатель -> подтверждение по почте)
   - Активные сессии (IP, геолокация, браузер, кнопка «Экстренно завершить все сессии» через почту)
   - Удаление аккаунта (подтверждение через почту)

### 4.2 Интеграция с общим приложением
- **`App.tsx`**: Добавление view `'cabinet'` в роутинг. Проверка параметра URL `?security_token=...` при старте для моментального подтверждения защитных действий.
- **`Navbar.tsx`**:
  - Если пользователь авторизован: компактный бейдж баланса (например, `1,450 ₽`) с кликом для перехода в кабинет + кнопка Профиля.
  - Если не авторизован: кнопка «Войти в кабинет» (открывает `AuthModal`).

---

## 5. Testing & Verification Plan
1. **Авторизация**: Тестирование входа через 1-Click Demo, через Лицензионный ключ и через Email/Password. Проверка выхода и сохранения сессии при перезагрузке страницы.
2. **Безопасность (Email Link Flow)**:
   - Инициация смены почты -> всплывает `EmailDispatcherModal` с токеном -> клик по ссылке подтверждения -> почта успешно обновляется в профиле.
   - Инициация смены пароля -> отправка письма -> подтверждение по ссылке -> успешная смена.
   - Привязка Telegram -> отправка письма -> подтверждение -> отображение привязанного Telegram в профиле.
   - Экстренное завершение всех сессий -> подтверждение по ссылке -> сессии сброшены.
   - Экстренный сброс HWID -> подтверждение по ссылке -> сброс HWID выполнен вне зависимости от кулдауна.
   - Включение 2FA и удаление аккаунта по ссылке.
3. **Кошелек и баланс**: Пополнение баланса с пресетами (250, 500, 1000, 2500) и произвольной суммой. Проверка отражения транзакции в аудите.
4. **Подписки**: Продление подписки за счет баланса, заморозка и разморозка.
5. **HWID**: Стандартный сброс с проверкой 7-дневного кулдауна.
6. **Загрузка лоадера**: Генерация одноразового защитного токена и скачивание исполняемого файла.
