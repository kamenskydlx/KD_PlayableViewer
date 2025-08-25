// Device presets for 2025 - popular devices with various aspect ratios
export const DEVICE_PRESETS = {
  // iPhone (популярные модели 2025)
  'iphone-13': {
    name: 'iPhone 13/14',
    width: 390,
    height: 844,
    pixelRatio: 3,
    category: 'iPhone'
  },
  'iphone-15': {
    name: 'iPhone 15/16',
    width: 393,
    height: 852,
    pixelRatio: 3,
    category: 'iPhone'
  },
  'iphone-15-pro': {
    name: 'iPhone 15/16 Pro',
    width: 393,
    height: 852,
    pixelRatio: 3,
    category: 'iPhone'
  },
  'iphone-15-plus': {
    name: 'iPhone 15/16 Plus',
    width: 430,
    height: 932,
    pixelRatio: 3,
    category: 'iPhone'
  },
  'iphone-15-pro-max': {
    name: 'iPhone 15/16 Pro Max',
    width: 430,
    height: 932,
    pixelRatio: 3,
    category: 'iPhone'
  },

  // Google Pixel
  'pixel-8': {
    name: 'Pixel 8',
    width: 412,
    height: 915,
    pixelRatio: 2.625,
    category: 'Android'
  },
  'pixel-8-pro': {
    name: 'Pixel 8 Pro',
    width: 448,
    height: 998,
    pixelRatio: 2.8125,
    category: 'Android'
  },
  'pixel-fold': {
    name: 'Pixel Fold (unfolded)',
    width: 673,
    height: 841,
    pixelRatio: 2.5,
    category: 'Foldable'
  },

  // Samsung Galaxy
  'galaxy-s24': {
    name: 'Galaxy S24',
    width: 384,
    height: 854,
    pixelRatio: 3,
    category: 'Android'
  },
  'galaxy-s24-ultra': {
    name: 'Galaxy S24 Ultra',
    width: 412,
    height: 915,
    pixelRatio: 3.5,
    category: 'Android'
  },
  'galaxy-z-fold5': {
    name: 'Galaxy Z Fold5 (unfolded)',
    width: 673,
    height: 841,
    pixelRatio: 2.6,
    category: 'Foldable'
  },

  // iPad
  'ipad-air': {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    pixelRatio: 2,
    category: 'Tablet'
  },
  'ipad-pro-11': {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    pixelRatio: 2,
    category: 'Tablet'
  },
  'ipad-pro-13': {
    name: 'iPad Pro 13"',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    category: 'Tablet'
  },
  'ipad-mini': {
    name: 'iPad Mini',
    width: 744,
    height: 1133,
    pixelRatio: 2,
    category: 'Tablet'
  },

  // Устройства с нестандартным соотношением сторон
  'steam-deck': {
    name: 'Steam Deck',
    width: 1280,
    height: 800,
    pixelRatio: 1,
    category: 'Gaming'
  },
  'surface-duo': {
    name: 'Surface Duo (single)',
    width: 540,
    height: 720,
    pixelRatio: 2.5,
    category: 'Unique'
  },
  'nothing-phone': {
    name: 'Nothing Phone (2)',
    width: 412,
    height: 915,
    pixelRatio: 2.75,
    category: 'Android'
  },
  'oneplus-open': {
    name: 'OnePlus Open (unfolded)',
    width: 648,
    height: 816,
    pixelRatio: 2.4,
    category: 'Foldable'
  }
};

// Default device
export const DEFAULT_DEVICE = 'iphone-13';

// Device categories for organizing
export const DEVICE_CATEGORIES = {
  iPhone: 'iPhone',
  Android: 'Android',
  Tablet: 'Планшеты',
  Foldable: 'Складные',
  Gaming: 'Игровые',
  Unique: 'Уникальные'
};

// Get device by key
export const getDevice = (key) => {
  return DEVICE_PRESETS[key] || DEVICE_PRESETS[DEFAULT_DEVICE];
};

// Get devices by category
export const getDevicesByCategory = () => {
  const grouped = {};
  
  Object.entries(DEVICE_PRESETS).forEach(([key, device]) => {
    const category = device.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ key, ...device });
  });
  
  return grouped;
};

// Calculate aspect ratio
export const getAspectRatio = (device) => {
  const ratio = device.width / device.height;
  return ratio.toFixed(3);
};

// Format device info for display
export const formatDeviceInfo = (device) => {
  return `${device.width}×${device.height} (${getAspectRatio(device)})`;
};