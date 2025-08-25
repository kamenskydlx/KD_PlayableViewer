import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Info,
  HardDrive,
  Calendar,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { publicAPI } from '../utils/api';
import { DEVICE_PRESETS, getDevice, DEFAULT_DEVICE } from '../utils/devices';
import LoadingSpinner from '../components/LoadingSpinner';
import DeviceSelector from '../components/DeviceSelector';
import toast from 'react-hot-toast';

const PlayView = () => {
  const { id } = useParams();
  const [playable, setPlayable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeviceKey, setSelectedDeviceKey] = useState(DEFAULT_DEVICE);
  const [customDevice, setCustomDevice] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const currentDevice = customDevice || getDevice(selectedDeviceKey);

  useEffect(() => {
    loadPlayable();
  }, [id]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'r' || e.key === 'R') {
        reloadPlayable();
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const loadPlayable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const playableData = await publicAPI.getPlayable(id);
      setPlayable(playableData);
    } catch (error) {
      console.error('Failed to load playable:', error);
      setError(error.response?.status === 404 ? 'not_found' : 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const reloadPlayable = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleDeviceChange = (deviceKey) => {
    setSelectedDeviceKey(deviceKey);
    setCustomDevice(null);
  };

  const handleCustomDevice = (device) => {
    setCustomDevice(device);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Ссылка скопирована в буфер обмена');
  };

  if (isLoading) {
    return <LoadingSpinner text="Загружаем плейбл..." />;
  }

  if (error === 'not_found') {
    return (
      <>
        <Helmet>
          <title>Плейбл не найден - Playable Viewer</title>
        </Helmet>
        <div className="min-h-screen bg-primary flex items-center justify-center px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-16 h-16 text-quaternary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">
              Плейбл не найден
            </h1>
            <p className="text-tertiary mb-8">
              Плейбл с указанным ID не существует или был удален
            </p>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Ошибка загрузки - Playable Viewer</title>
        </Helmet>
        <div className="min-h-screen bg-primary flex items-center justify-center px-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">
              Ошибка загрузки
            </h1>
            <p className="text-tertiary mb-8">
              Не удалось загрузить плейбл. Попробуйте обновить страницу.
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={loadPlayable} className="btn btn-primary">
                Попробовать снова
              </button>
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{playable.name} v{playable.version} - Playable Viewer</title>
        <meta name="description" content={`Просмотр плейбла ${playable.name} версии ${playable.version}`} />
      </Helmet>

      <div 
        ref={containerRef}
        className={`min-h-screen bg-primary ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      >
        {/* Compact Header */}
        <header className={`bg-secondary/95 backdrop-blur-sm border-b border-border/50 transition-all ${
          isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : 'sticky top-0'
        }`}>
          <div className="px-4 py-2">
            <div className="flex items-center justify-between gap-4">
              {/* Left section */}
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => window.history.back()}
                  className="btn btn-ghost btn-sm shrink-0"
                  title="Назад"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-semibold text-primary truncate">
                    {playable.name}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-quaternary">
                    <span>v{playable.version}</span>
                    <span>•</span>
                    <span>{formatFileSize(playable.size)}</span>
                  </div>
                </div>
              </div>

              {/* Center section - Device Selector */}
              <div className="hidden md:block">
                <DeviceSelector
                  selectedDevice={currentDevice}
                  onDeviceChange={handleDeviceChange}
                  onCustomDevice={handleCustomDevice}
                />
              </div>

              {/* Right section - Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={reloadPlayable}
                  className="btn btn-ghost btn-sm"
                  title="Перезагрузить плейбл (R)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="btn btn-ghost btn-sm"
                  title="Информация"
                >
                  <Info className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="btn btn-ghost btn-sm"
                  title={`${isFullscreen ? 'Выйти из' : 'Войти в'} полноэкранный режим (F)`}
                >
                  {isFullscreen ? 
                    <Minimize2 className="w-4 h-4" /> : 
                    <Maximize2 className="w-4 h-4" />
                  }
                </button>

                <button
                  onClick={() => window.open(`/uploads/${id}.html`, '_blank')}
                  className="btn btn-primary btn-sm"
                  title="Открыть в новой вкладке"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Device Selector */}
            <div className="md:hidden mt-2 pt-2 border-t border-border/30">
              <DeviceSelector
                selectedDevice={currentDevice}
                onDeviceChange={handleDeviceChange}
                onCustomDevice={handleCustomDevice}
              />
            </div>
          </div>

          {/* Info Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border/30 bg-tertiary/50"
              >
                <div className="px-4 py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-accent" />
                      <div>
                        <div className="text-quaternary">Название</div>
                        <div className="text-secondary font-medium">{playable.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-accent" />
                      <div>
                        <div className="text-quaternary">Размер</div>
                        <div className="text-secondary font-medium">{formatFileSize(playable.size)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <div>
                        <div className="text-quaternary">Загружен</div>
                        <div className="text-secondary font-medium">{formatDate(playable.uploadDate)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                    <div className="text-xs text-quaternary">
                      Текущее разрешение: {currentDevice.width}×{currentDevice.height}
                      {currentDevice.pixelRatio && currentDevice.pixelRatio !== 1 && (
                        ` (${currentDevice.pixelRatio}x)`
                      )}
                    </div>
                    <button
                      onClick={copyLink}
                      className="btn btn-ghost btn-sm text-xs"
                    >
                      Копировать ссылку
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Playable Container */}
        <main className={`flex items-center justify-center bg-quaternary/20 ${
          isFullscreen ? 'h-full pt-20' : ''
        }`} style={{ 
          minHeight: isFullscreen ? 'calc(100vh - 80px)' : 'calc(100vh - 140px)' 
        }}>
          <div className="p-4 w-full h-full flex items-center justify-center">
            {/* Device Frame */}
            <motion.div
              key={`${currentDevice.width}x${currentDevice.height}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                width: Math.min(currentDevice.width, window.innerWidth - 40),
                height: Math.min(currentDevice.height, window.innerHeight - (isFullscreen ? 120 : 200)),
                maxWidth: '90vw',
                maxHeight: '80vh'
              }}
            >
              {/* Device Screen */}
              <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={`/uploads/${id}.html`}
                  className="w-full h-full border-0"
                  title={`${playable.name} v${playable.version}`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
                  style={{
                    width: currentDevice.width,
                    height: currentDevice.height,
                    transform: `scale(${Math.min(
                      (window.innerWidth - 40) / currentDevice.width,
                      (window.innerHeight - (isFullscreen ? 120 : 200)) / currentDevice.height,
                      1
                    )})`,
                    transformOrigin: 'top left'
                  }}
                  onLoad={() => {
                    console.log(`Playable ${playable.name} loaded successfully`);
                  }}
                  onError={(e) => {
                    console.error('Failed to load playable iframe:', e);
                  }}
                />
              </div>

              {/* Device Label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-secondary/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-tertiary">
                  {currentDevice.name} ({currentDevice.width}×{currentDevice.height})
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Keyboard Shortcuts Help */}
        {!isFullscreen && (
          <div className="fixed bottom-4 right-4 z-40">
            <div className="bg-secondary/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs text-quaternary">
              <div className="font-medium text-secondary mb-1">Горячие клавиши:</div>
              <div>R - перезагрузить</div>
              <div>F - полный экран</div>
              <div>ESC - выйти из полного экрана</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlayView;