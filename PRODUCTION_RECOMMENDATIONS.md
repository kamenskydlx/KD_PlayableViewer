# 🔒 Рекомендации для Production

## Безопасность

### 1. Пароли администратора
**Текущее состояние**: Поддерживает как обычные, так и хешированные пароли
**Рекомендация**: Используйте хешированные пароли

```bash
# Сгенерируйте хешированный пароль
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-secure-password', 10));"
```

Затем в .env файле:
```env
ADMIN_PASSWORD=$2b$10$HASH_HERE
```

### 2. HTTPS
**Текущее состояние**: HTTP
**Рекомендация**: Настройте SSL/TLS сертификаты

```bash
# Установите Certbot для Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d kamensky.isgood.host
```

### 3. Firewall
```bash
# Настройте UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Производительность

### 1. Nginx кеширование
Добавьте в nginx.conf:
```nginx
# Cache for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Database вместо JSON
**Текущее состояние**: JSON файлы
**Рекомендация**: PostgreSQL или MongoDB для production

### 3. File Storage
**Текущее состояние**: Локальные файлы
**Рекомендация**: AWS S3, MinIO или другое облачное хранилище

## Мониторинг

### 1. Логирование
Добавьте в docker-compose.yml:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 2. Health checks
Настройте мониторинг эндпоинта `/health`

### 3. Backup
Настройте автоматический backup:
- metadata.json
- uploads папки
- Docker volumes

## Масштабирование

### 1. Load Balancing
```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 3
```

### 2. Redis для сессий
```yaml
redis:
  image: redis:alpine
  restart: unless-stopped
```

### 3. CDN
Настройте CloudFlare или AWS CloudFront для статических файлов

## Обновления

### 1. Зависимости
```bash
# Регулярно обновляйте
npm audit fix
docker pull node:20-alpine
docker pull nginx:alpine
```

### 2. Операционная система
```bash
sudo apt update && sudo apt upgrade
```

### 3. Docker
```bash
# Очистка старых образов
docker system prune -f
```

## Резервное копирование

### Автоматический скрипт backup
```bash
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup metadata
cp /root/playable-viewer/metadata.json $BACKUP_DIR/

# Backup uploads
tar -czf $BACKUP_DIR/uploads.tar.gz /root/playable-viewer/uploads/

# Backup docker volumes
docker run --rm -v playable-viewer_frontend-build:/data alpine tar czf - /data > $BACKUP_DIR/frontend-build.tar.gz
```

## Мониторинг производительности

### 1. Prometheus + Grafana
```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
```

### 2. Node.js метрики
Добавьте prometheus middleware в backend

## Безопасность файлов

### 1. Антивирус сканирование
Интегрируйте ClamAV для сканирования загружаемых файлов

### 2. Sandboxing
Запускайте playable файлы в изолированной среде

### 3. Content validation
Усильте валидацию HTML файлов против XSS/CSRF атак