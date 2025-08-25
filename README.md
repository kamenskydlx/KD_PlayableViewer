# Playable Viewer Service

Сервис для показа HTML плейблов клиентам с админкой для управления контентом.

## Описание проекта

**Playable Viewer Service** - это веб-сервис, который позволяет:

### Для администратора:
- 🔐 Вход в админку через логин/пароль
- 📁 Загрузка HTML плейблов (до 20MB)
- 🗂️ Группировка плейблов по папкам для отслеживания версий
- ✏️ Переименование плейблов
- 🗑️ Удаление плейблов
- 📊 Просмотр метаданных (название, версия, размер)

### Для клиентов:
- 🎮 Просмотр плейблов по прямым ссылкам
- 👁️ Видимость только названия, версии и размера
- 🚫 Нет доступа к полному списку плейблов

## Архитектура

```
├── backend/              # Node.js + Express API
├── frontend/             # React приложение
├── uploads/              # HTML плейблы
├── metadata.json         # Метаданные плейблов
├── nginx/                # Nginx конфигурация
├── docker-compose.yml    # Docker настройки
└── .github/workflows/    # GitHub Actions CI/CD
```

## Технологии

- **Backend**: Node.js, Express.js
- **Frontend**: React, Axios
- **Деплой**: Docker, Nginx, GitHub Actions
- **Хранение**: Файловая система + JSON метаданные

## Установка и запуск

### Локальная разработка

1. **Клонировать репозиторий**
```bash
git clone <repository-url>
cd playable-viewer
```

2. **Установить зависимости**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

3. **Запустить в режиме разработки**
```bash
# Backend (порт 3001)
cd backend && npm run dev

# Frontend (порт 3000) 
cd frontend && npm start
```

### Продакшн через Docker

1. **Сборка и запуск**
```bash
docker-compose up -d --build
```

Сервис будет доступен по адресу: `http://kamensky.isgood.host`

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Админка
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Сервер
PORT=3001
NODE_ENV=production

# Лимиты
MAX_FILE_SIZE=20971520  # 20MB в байтах
```

### Nginx конфигурация

Nginx настроен для:
- Проксирования API запросов к backend
- Раздачи статических файлов frontend
- Раздачи плейблов из папки uploads

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в админку
- `POST /api/auth/logout` - Выход из админки
- `GET /api/auth/check` - Проверка авторизации

### Управление плейблами
- `GET /api/playables` - Список всех плейблов (админ)
- `GET /api/playables/:id` - Информация о плейбле
- `POST /api/playables/upload` - Загрузка плейбла (админ)
- `PUT /api/playables/:id` - Обновление метаданных (админ)
- `DELETE /api/playables/:id` - Удаление плейбла (админ)

### Публичные эндпоинты
- `GET /api/public/playable/:id` - Метаданные плейбла для клиентов
- `GET /play/:id` - Просмотр плейбла

## Структура данных

### Метаданные плейбла (metadata.json)
```json
{
  "playables": {
    "unique-id": {
      "id": "unique-id",
      "name": "My Game",
      "version": "1.0.0",
      "folder": "project-name",
      "filename": "original-name.html",
      "size": 1024576,
      "uploadDate": "2024-01-01T00:00:00.000Z"
    }
  },
  "folders": ["project-name", "another-project"]
}
```

## Деплой

### GitHub Actions

Пуш в `main` ветку автоматически:
1. Собирает Docker образы
2. Деплоит на VPS через SSH
3. Перезапускает сервис

### Настройка сервера

На Ubuntu 24.04 VPS:

1. **Установить Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Настроить GitHub Secrets**
- `SERVER_HOST`: kamensky.isgood.host
- `SERVER_USER`: ваш пользователь
- `SERVER_SSH_KEY`: приватный SSH ключ

## Шаги разработки

### Phase 1: Базовая функциональность
- [ ] Настройка проекта и Docker
- [ ] Backend API с аутентификацией
- [ ] Загрузка и управление файлами
- [ ] Базовый frontend для админки

### Phase 2: Пользовательский интерфейс
- [ ] Красивый дизайн админки
- [ ] Публичные страницы для просмотра плейблов
- [ ] Управление папками и версиями

### Phase 3: Деплой и автоматизация
- [ ] GitHub Actions настройка
- [ ] Nginx конфигурация для работы без портов
- [ ] Тестирование на продакшн сервере

### Phase 4: Улучшения
- [ ] Логирование и мониторинг
- [ ] Оптимизация производительности
- [ ] Backup стратегия

## Безопасность

- 🔒 Простая аутентификация через логин/пароль
- 🛡️ Валидация загружаемых файлов
- 📝 Логирование всех административных действий
- 🚫 Ограничение размера файлов (20MB)

## Поддержка

Для вопросов и предложений создавайте Issues в GitHub репозитории.