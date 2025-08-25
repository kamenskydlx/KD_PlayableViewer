import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Upload, 
  HardDrive, 
  Clock, 
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { playablesAPI } from '../../utils/api';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const DashboardTab = () => {
  const [stats, setStats] = useState(null);
  const [recentPlayables, setRecentPlayables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await playablesAPI.getAll();
      
      // Calculate stats
      const playables = Object.values(data.playables);
      const totalSize = playables.reduce((sum, p) => sum + p.size, 0);
      const totalFolders = data.folders.length;
      
      // Get recent playables (last 5)
      const recent = playables
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 5);

      setStats({
        totalPlayables: playables.length,
        totalSize,
        totalFolders,
        recentCount: recent.length
      });
      
      setRecentPlayables(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Не удалось загрузить данные дашборда');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Загружаем статистику..." />;
  }

  const statCards = [
    {
      title: 'Всего плейблов',
      value: stats?.totalPlayables || 0,
      icon: FolderOpen,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Общий размер',
      value: formatFileSize(stats?.totalSize || 0),
      icon: HardDrive,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Папок',
      value: stats?.totalFolders || 0,
      icon: Upload,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      title: 'Недавние',
      value: stats?.recentCount || 0,
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Обзор системы
        </h1>
        <p className="text-tertiary">
          Статистика и недавняя активность
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className="card hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-tertiary">{stat.title}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Playables */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-primary">
              Недавние плейблы
            </h2>
          </div>

          <div className="space-y-3">
            {recentPlayables.length > 0 ? (
              recentPlayables.map((playable) => (
                <div
                  key={playable.id}
                  className="flex items-center justify-between p-3 bg-tertiary rounded-lg hover:bg-quaternary transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary">
                        {playable.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-quaternary">
                        <span>v{playable.version}</span>
                        <span>•</span>
                        <span>{formatFileSize(playable.size)}</span>
                        {playable.folder && (
                          <>
                            <span>•</span>
                            <span>{playable.folder}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(`/play/${playable.id}`, '_blank')}
                      className="btn btn-ghost btn-sm"
                      title="Просмотреть"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-quaternary mx-auto mb-3" />
                <p className="text-tertiary">Плейблы отсутствуют</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-primary">
              Быстрые действия
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-tertiary rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="w-5 h-5 text-accent" />
                <h3 className="font-medium text-secondary">
                  Загрузить плейбл
                </h3>
              </div>
              <p className="text-sm text-quaternary mb-4">
                Добавьте новый HTML плейбл в систему
              </p>
              <button className="btn btn-primary btn-sm w-full">
                Перейти к загрузке
              </button>
            </div>

            <div className="p-4 bg-tertiary rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FolderOpen className="w-5 h-5 text-blue-400" />
                <h3 className="font-medium text-secondary">
                  Управление плейблами
                </h3>
              </div>
              <p className="text-sm text-quaternary mb-4">
                Просмотр, редактирование и удаление плейблов
              </p>
              <button className="btn btn-secondary btn-sm w-full">
                Открыть список
              </button>
            </div>

            <div className="p-4 bg-tertiary rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Download className="w-5 h-5 text-yellow-400" />
                <h3 className="font-medium text-secondary">
                  Создать ссылку
                </h3>
              </div>
              <p className="text-sm text-quaternary mb-4">
                Получите прямую ссылку на любой плейбл
              </p>
              <button className="btn btn-secondary btn-sm w-full">
                Выбрать плейбл
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Info */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-primary mb-4">
          Информация о системе
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-quaternary">Версия</p>
            <p className="text-secondary font-medium">v1.0.0</p>
          </div>
          <div>
            <p className="text-quaternary">Последнее обновление</p>
            <p className="text-secondary font-medium">
              {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div>
            <p className="text-quaternary">Статус</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <p className="text-accent font-medium">Работает</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardTab;