# 🚀 Полная инструкция по развертыванию Playable Viewer Service (ИСПРАВЛЕННАЯ ВЕРСИЯ)

> **ВАЖНО**: Эта версия содержит исправления всех выявленных проблем:
> - ✅ Исправлены пути в fileManager.js
> - ✅ Добавлен static middleware для uploads
> - ✅ Исправлен импорт rateLimiter
> - ✅ Смягчен rate limiting
> - ✅ Исправлены Docker volume проблемы
> - ✅ Добавлен favicon
> - ✅ Улучшена безопасность паролей

## 📋 Что нужно подготовить

### На вашем компьютере:
- Git
- Аккаунт на GitHub
- SSH ключ для доступа к серверу

### На сервере (Ubuntu 24.04):
- Docker и Docker Compose
- Git
- Nginx (опционально, для дополнительной настройки)

## 1️⃣ Подготовка проекта

### 1.1 Инициализация Git репозитория

```bash
# Находясь в папке E:\KD_PlayableViewer
cd E:\KD_PlayableViewer

# Инициализируем Git репозиторий
git init

# Добавляем все файлы
git add .

# Делаем первый коммит
git commit -m "Initial commit: Playable Viewer Service

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 1.2 Создание репозитория на GitHub

1. Зайдите на [GitHub](https://github.com)
2. Нажмите **New repository**
3. Название: `playable-viewer-service`
4. Выберите **Private** или **Public**
5. **НЕ** инициализируйте с README, .gitignore или лицензией
6. Нажмите **Create repository**

### 1.3 Подключение к GitHub

```bash
# Добавляем удаленный репозиторий (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/playable-viewer-service.git

# Пушим код
git branch -M main
git push -u origin main
```

## 2️⃣ Настройка GitHub Actions

### 2.1 Создание GitHub Secrets

Зайдите в настройки репозитория: `Settings` → `Secrets and variables` → `Actions`

Добавьте следующие **Repository secrets**:

| Secret | Значение | Описание |
|--------|----------|----------|
| `SERVER_HOST` | `kamensky.isgood.host` | Ваш домен |
| `SERVER_USER` | `ваш_пользователь` | Имя пользователя на сервере |
| `SERVER_SSH_KEY` | `содержимое_приватного_ключа` | SSH ключ для подключения |

### 2.2 Генерация SSH ключа (если нет)

На вашем компьютере:

```bash
# Генерируем SSH ключ
ssh-keygen -t rsa -b 4096 -C "deploy@playable-viewer"

# Путь по умолчанию: ~/.ssh/id_rsa
# Можете задать пустую парольную фразу для автоматизации

# Копируем публичный ключ
cat ~/.ssh/id_rsa.pub
```

## 3️⃣ Настройка сервера

### 3.1 Подключение к серверу

```bash
# Подключаемся к серверу
ssh ваш_пользователь@kamensky.isgood.host
```

### 3.2 Установка Docker (если не установлен)

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиниваемся для применения изменений
exit
ssh ваш_пользователь@kamensky.isgood.host

# Проверяем установку
docker --version
docker-compose --version
```

### 3.3 Добавление SSH ключа на сервер

```bash
# Создаем папку для SSH ключей (если нет)
mkdir -p ~/.ssh

# Добавляем публичный ключ (замените на ваш ключ)
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC..." >> ~/.ssh/authorized_keys

# Устанавливаем правильные права
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 3.4 Установка Git (если нет)

```bash
sudo apt install git -y
```

## 4️⃣ Первый деплой

### 4.1 Создание .env файла

После первого деплоя создайте файл `.env`:

```bash
# На сервере, в папке проекта
cd /home/ваш_пользователь/playable-viewer

# Создаем .env из примера
cp .env.example .env

# Редактируем настройки
nano .env
```

**Содержимое .env:**
```env
# Админка - ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ ПАРОЛЬ!
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ваш_очень_сложный_пароль_123!

# Сервер
PORT=3001
NODE_ENV=production

# Лимиты
MAX_FILE_SIZE=20971520  # 20MB в байтах
```

### 4.2 Запуск первого деплоя

Теперь сделайте любое изменение в коде и запушьте:

```bash
# На вашем компьютере
cd E:\KD_PlayableViewer

# Делаем небольшое изменение (например, в README)
echo "" >> README.md

# Коммитим и пушим
git add .
git commit -m "Trigger first deployment"
git push origin main
```

GitHub Actions автоматически запустит деплой!

## 5️⃣ Настройка Nginx (для работы без портов)

### 5.1 Установка Nginx

```bash
# На сервере
sudo apt install nginx -y

# Запускаем и добавляем в автозагрузку
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5.2 Настройка конфигурации

```bash
# Создаем конфигурацию для сайта
sudo nano /etc/nginx/sites-available/playable-viewer
```

**Содержимое файла:**
```nginx
server {
    listen 80;
    server_name kamensky.isgood.host;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Client max body size for uploads
    client_max_body_size 25M;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 Активация конфигурации

```bash
# Создаем символическую ссылку
sudo ln -s /etc/nginx/sites-available/playable-viewer /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
```

## 6️⃣ Проверка работы

### 6.1 Проверка сервисов

```bash
# На сервере
cd /home/ваш_пользователь/playable-viewer

# Проверяем статус контейнеров
docker-compose ps

# Смотрим логи
docker-compose logs -f --tail=50

# Проверяем доступность
curl http://localhost/health
```

### 6.2 Тестирование в браузере

1. Откройте `http://kamensky.isgood.host`
2. Должна открыться страница с редиректом на `/admin`
3. Перейдите на `http://kamensky.isgood.host/admin/login`
4. Войдите с учетными данными из `.env`

## 7️⃣ Обновления и поддержка

### 7.1 Автоматические обновления

Любой пуш в `main` ветку автоматически деплоит изменения:

```bash
# На вашем компьютере
git add .
git commit -m "Update feature X"
git push origin main
```

### 7.2 Ручной деплой

```bash
# На сервере
cd /home/ваш_пользователь/playable-viewer

# Останавливаем сервисы
docker-compose down

# Обновляем код
git pull origin main

# Пересобираем и запускаем
docker-compose up -d --build
```

### 7.3 Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только nginx
docker-compose logs -f nginx
```

### 7.4 Перезапуск сервисов

```bash
# Перезапуск всех сервисов
docker-compose restart

# Перезапуск конкретного сервиса
docker-compose restart backend
```

## 8️⃣ Резервное копирование

### 8.1 Настройка backup

```bash
# Создаем скрипт резервного копирования
nano ~/backup-playables.sh
```

**Содержимое скрипта:**
```bash
#!/bin/bash
BACKUP_DIR="/home/ваш_пользователь/backups"
PROJECT_DIR="/home/ваш_пользователь/playable-viewer"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Архивируем uploads и метаданные
tar -czf $BACKUP_DIR/playables_backup_$DATE.tar.gz \
    -C $PROJECT_DIR uploads metadata.json

# Удаляем старые backup'ы (старше 30 дней)
find $BACKUP_DIR -name "playables_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: playables_backup_$DATE.tar.gz"
```

```bash
# Делаем скрипт исполняемым
chmod +x ~/backup-playables.sh

# Добавляем в cron (ежедневно в 2:00)
crontab -e

# Добавьте строку:
# 0 2 * * * /home/ваш_пользователь/backup-playables.sh
```

## 9️⃣ Решение проблем

### 9.1 Проблемы с Docker

```bash
# Очистка системы Docker
docker system prune -a

# Пересборка без кэша
docker-compose build --no-cache

# Проверка портов
sudo netstat -tulpn | grep :80
```

### 9.2 Проблемы с Nginx

```bash
# Проверка статуса
sudo systemctl status nginx

# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx
```

### 9.3 Проблемы с GitHub Actions

1. Проверьте secrets в настройках репозитория
2. Убедитесь, что SSH ключ корректный
3. Проверьте логи деплоя в разделе "Actions"

### 9.4 Проблемы с доступом

```bash
# Проверьте firewall
sudo ufw status

# Разрешите порты (если нужно)
sudo ufw allow 80
sudo ufw allow 22
```

## ✅ Контрольный список

- [ ] Создан GitHub репозиторий
- [ ] Настроены GitHub Secrets
- [ ] SSH ключ добавлен на сервер
- [ ] Docker установлен на сервере
- [ ] Файл `.env` создан и настроен
- [ ] Nginx настроен (опционально)
- [ ] Первый деплой выполнен успешно
- [ ] Сайт доступен по адресу `http://kamensky.isgood.host`
- [ ] Админка работает
- [ ] Можно загружать и просматривать плейблы
- [ ] Настроено резервное копирование

## 📞 Поддержка

Если что-то не работает:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус сервисов: `docker-compose ps`
3. Проверьте GitHub Actions в разделе "Actions"
4. Убедитесь, что все секреты настроены правильно

---

**🎉 Поздравляем! Ваш Playable Viewer Service готов к работе!**

После выполнения всех шагов у вас будет:
- Современная админка для управления плейблами
- Автоматический деплой через GitHub Actions  
- Публичные ссылки для клиентов
- Адаптивный просмотр на всех популярных устройствах 2025 года
- Полноценная система резервного копирования

**Доступ к сервису:** `http://kamensky.isgood.host`