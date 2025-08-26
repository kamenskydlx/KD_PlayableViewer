# 📝 История изменений

## [1.1.0] - 2025-08-26 - ИСПРАВЛЕННАЯ ВЕРСИЯ

### 🔧 Исправления

#### Backend
- **Исправлены пути к файлам**: Изменены пути в `fileManager.js` с относительных на абсолютные `/app/uploads` и `/app/metadata.json`
- **Добавлен static middleware**: Добавлена строка `app.use('/uploads', express.static('/app/uploads'));` в `server.js` для обслуживания статических файлов
- **Исправлен импорт rateLimiter**: Изменен импорт с `const rateLimiter = require()` на `const { rateLimiter } = require()` с деструктуризацией
- **Смягчен rate limiting**: 
  - Общий лимит: 100 → 1000 запросов/15 минут
  - Auth лимит: 5 → 20 попыток входа/15 минут
- **Улучшена безопасность паролей**: Добавлена поддержка bcrypt хешированных паролей в `auth.js`

#### Frontend & Docker
- **Исправлены Docker volume проблемы**: Изменен volume mapping frontend с `/app/build` на `/usr/share/nginx/html`
- **Добавлен favicon**: Скопирован favicon.ico в `frontend/public/` для устранения 404 ошибок

#### Инфраструктура
- **Обновлен docker-compose.yml**: Исправлены проблемы с volume mapping для правильной работы React приложения
- **Обновлен DEPLOY_GUIDE.md**: Добавлены исправления всех выявленных проблем

### 📚 Документация
- **Создан PRODUCTION_RECOMMENDATIONS.md**: Рекомендации по безопасности, производительности и мониторингу
- **Обновлен README.md**: Добавлена информация об исправлениях
- **Создан CHANGELOG.md**: Документирование всех изменений

### 🧪 Тестирование
- Все изменения протестированы в процессе разработки
- Подтверждена работоспособность загрузки и просмотра playables
- Проверено функционирование админ-панели

### 🔄 Миграция с предыдущей версии

Если у вас уже развернута предыдущая версия:

1. **Обновите код**:
   ```bash
   git pull origin main
   ```

2. **Пересоберите контейнеры**:
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

3. **Исправьте права на файлы** (если требуется):
   ```bash
   chmod 666 metadata.json
   chmod 777 uploads/
   ```

---

## [1.0.0] - 2025-08-25 - ПЕРВАЯ ВЕРСИЯ

### ✨ Основные функции

#### Backend (Node.js/Express)
- JWT аутентификация для админов
- API для управления playables
- Загрузка HTML файлов до 20MB
- Валидация HTML контента
- Организация по папкам
- Метаданные в JSON формате
- Rate limiting для защиты
- Обработка ошибок
- Health check endpoints

#### Frontend (React)
- Современный интерфейс с темной темой 2025 года
- Админ-панель с табами (Dashboard, Upload, Playables, Settings)
- Device resolution тестирование
- Компактный header в viewer
- Drag & drop загрузка файлов
- Управление папками
- Предпросмотр playables
- Responsive дизайн

#### Инфраструктура
- Docker Compose архитектура
- Nginx reverse proxy
- Автоматическое развертывание через GitHub Actions
- Health checks для всех сервисов
- Volume persistence для данных

### 🎨 Дизайн
- Глубокая серая цветовая схема
- Зеленые акценты (#10B981)
- Современная типографика
- Плавные анимации (Framer Motion)
- CSS custom properties для тем

### 🔒 Безопасность
- JWT токены для аутентификации
- Rate limiting на всех endpoints
- CORS настройки
- Helmet.js security headers
- HTML валидация загружаемых файлов

### 🚀 DevOps
- GitHub Actions CI/CD
- Автоматическое развертывание на push
- Docker multi-stage builds
- Nginx кеширование статических ресурсов
- Логирование и мониторинг

### 📝 Документация
- Полный deployment guide
- README с описанием функций
- Комментарии в коде
- Environment variables документация