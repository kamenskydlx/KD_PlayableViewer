import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Tablet, 
  Monitor,
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  getDevicesByCategory, 
  DEVICE_CATEGORIES, 
  formatDeviceInfo 
} from '../utils/devices';

const DeviceSelector = ({ selectedDevice, onDeviceChange, onCustomDevice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  
  const devicesByCategory = getDevicesByCategory();

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'iPhone':
      case 'Android':
        return <Smartphone className="w-4 h-4" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4" />;
      case 'Gaming':
      case 'Foldable':
      case 'Unique':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Smartphone className="w-4 h-4" />;
    }
  };

  const handleDeviceSelect = (deviceKey) => {
    onDeviceChange(deviceKey);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0 && width <= 4000 && height <= 4000) {
      const customDevice = {
        name: `Custom ${width}×${height}`,
        width,
        height,
        pixelRatio: 1,
        category: 'Custom'
      };
      onCustomDevice(customDevice);
      setShowCustomModal(false);
      setCustomWidth('');
      setCustomHeight('');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Device Selector Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-secondary btn-sm flex items-center gap-2 min-w-48"
        >
          {getCategoryIcon(selectedDevice.category)}
          <span className="truncate">{selectedDevice.name}</span>
          <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 right-0 bg-secondary border border-border rounded-lg shadow-xl z-50 min-w-80 max-h-96 overflow-y-auto"
              >
                <div className="p-3">
                  {/* Custom Resolution Option */}
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-tertiary rounded-lg transition mb-3"
                  >
                    <Settings className="w-4 h-4 text-accent" />
                    <div>
                      <div className="font-medium text-secondary">
                        Произвольное разрешение
                      </div>
                      <div className="text-xs text-quaternary">
                        Задать custom размеры
                      </div>
                    </div>
                  </button>
                  
                  <div className="border-t border-border pt-3">
                    {/* Device Categories */}
                    {Object.entries(devicesByCategory).map(([category, devices]) => (
                      <div key={category} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-quaternary uppercase tracking-wide">
                          {getCategoryIcon(category)}
                          {DEVICE_CATEGORIES[category] || category}
                        </div>
                        <div className="space-y-1 mt-1">
                          {devices.map((device) => (
                            <button
                              key={device.key}
                              onClick={() => handleDeviceSelect(device.key)}
                              className={`w-full flex items-center justify-between p-2 text-left hover:bg-tertiary rounded transition ${
                                selectedDevice.name === device.name ? 'bg-accent/20 text-accent' : ''
                              }`}
                            >
                              <span className="font-medium text-sm">
                                {device.name}
                              </span>
                              <span className="text-xs text-quaternary">
                                {formatDeviceInfo(device)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Resolution Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-secondary border border-border rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">
                  Произвольное разрешение
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Ширина (px)
                    </label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="input text-sm"
                      placeholder="390"
                      min="200"
                      max="4000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">
                      Высота (px)
                    </label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="input text-sm"
                      placeholder="844"
                      min="200"
                      max="4000"
                      required
                    />
                  </div>
                </div>
                
                <div className="text-xs text-quaternary">
                  Диапазон: 200-4000px для каждого измерения
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    Применить
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="btn btn-secondary"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeviceSelector;