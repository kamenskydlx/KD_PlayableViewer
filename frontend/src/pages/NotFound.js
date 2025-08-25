import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Страница не найдена - Playable Viewer</title>
      </Helmet>
      
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-20 h-20 text-quaternary mx-auto mb-6" />
          
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          
          <h2 className="text-2xl font-semibold text-secondary mb-4">
            Страница не найдена
          </h2>
          
          <p className="text-tertiary mb-8 max-w-md">
            Запрашиваемая страница не существует или была перемещена.
            Проверьте правильность адреса или вернитесь на главную.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/admin'}
              className="btn btn-primary"
            >
              <Home className="w-4 h-4" />
              На главную
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
};

export default NotFound;