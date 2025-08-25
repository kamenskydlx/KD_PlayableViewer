import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Info, Shield, Server, Database } from 'lucide-react';

const SettingsTab = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Настройки</h1>
        <p className="text-tertiary">Конфигурация и информация о системе</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Info */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-primary">Информация о системе</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-tertiary">Версия:</span>
              <span className="text-secondary font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Окружение:</span>
              <span className="text-secondary font-medium">
                {process.env.NODE_ENV || 'development'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Максимальный размер файла:</span>
              <span className="text-secondary font-medium">20 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Поддерживаемые форматы:</span>
              <span className="text-secondary font-medium">HTML</span>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-primary">Безопасность</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-tertiary rounded-lg">
              <h3 className="font-medium text-secondary mb-2">Аутентификация</h3>
              <p className="text-sm text-quaternary">
                Простая аутентификация через логин и пароль
              </p>
            </div>
            
            <div className="p-4 bg-tertiary rounded-lg">
              <h3 className="font-medium text-secondary mb-2">Валидация файлов</h3>
              <p className="text-sm text-quaternary">
                Проверка типа и размера загружаемых файлов
              </p>
            </div>
            
            <div className="p-4 bg-tertiary rounded-lg">
              <h3 className="font-medium text-secondary mb-2">Rate Limiting</h3>
              <p className="text-sm text-quaternary">
                Ограничение количества запросов к API
              </p>
            </div>
          </div>
        </motion.div>

        {/* Storage */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-primary">Хранилище</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-tertiary">Тип хранилища:</span>
              <span className="text-secondary font-medium">Файловая система</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Метаданные:</span>
              <span className="text-secondary font-medium">JSON файлы</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Путь к файлам:</span>
              <span className="text-secondary font-medium">/uploads</span>
            </div>
          </div>
        </motion.div>

        {/* Server Status */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-primary">Статус сервера</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-tertiary">API Статус:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-accent font-medium">Работает</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-tertiary">Время запуска:</span>
              <span className="text-secondary font-medium">
                {new Date().toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* API Endpoints */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-primary mb-6">API Endpoints</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-secondary mb-3">Аутентификация</h3>
            <div className="space-y-2 text-quaternary">
              <div>POST /api/auth/login</div>
              <div>GET /api/auth/check</div>
              <div>POST /api/auth/logout</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-secondary mb-3">Плейблы (Админ)</h3>
            <div className="space-y-2 text-quaternary">
              <div>GET /api/playables</div>
              <div>POST /api/playables/upload</div>
              <div>PUT /api/playables/:id</div>
              <div>DELETE /api/playables/:id</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-secondary mb-3">Публичные</h3>
            <div className="space-y-2 text-quaternary">
              <div>GET /api/public/playable/:id</div>
              <div>GET /play/:id</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-secondary mb-3">Файлы</h3>
            <div className="space-y-2 text-quaternary">
              <div>GET /uploads/:filename</div>
              <div>GET /health</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsTab;