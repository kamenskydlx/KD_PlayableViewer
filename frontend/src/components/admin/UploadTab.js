import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Check } from 'lucide-react';
import { playablesAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const UploadTab = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0.0',
    folder: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/html': ['.html', '.htm'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        if (!formData.name) {
          setFormData(prev => ({ ...prev, name: file.name.replace(/\.(html?|htm)$/, '') }));
        }
      }
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error('Файл слишком большой. Максимальный размер: 20MB');
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Поддерживаются только HTML файлы');
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Выберите файл для загрузки');
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('playable', selectedFile);
      uploadFormData.append('name', formData.name);
      uploadFormData.append('version', formData.version);
      uploadFormData.append('folder', formData.folder);

      await playablesAPI.upload(uploadFormData);
      toast.success('Плейбл успешно загружен!');
      
      // Reset form
      setFormData({ name: '', version: '1.0.0', folder: '' });
      setSelectedFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка загрузки файла';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Загрузка плейбла</h1>
        <p className="text-tertiary">Добавьте новый HTML плейбл в систему</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-4">Файл</h2>
          
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-border-light'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-accent' : 'text-quaternary'}`} />
              <h3 className="text-lg font-medium text-secondary mb-2">
                {isDragActive ? 'Отпустите файл здесь' : 'Перетащите HTML файл сюда'}
              </h3>
              <p className="text-tertiary mb-4">или нажмите, чтобы выбрать файл</p>
              <p className="text-xs text-quaternary">Поддерживаются: HTML файлы до 20MB</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-tertiary rounded-lg"
            >
              <FileText className="w-8 h-8 text-accent" />
              <div className="flex-1">
                <p className="font-medium text-secondary">{selectedFile.name}</p>
                <p className="text-sm text-quaternary">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="btn btn-ghost btn-sm"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Metadata */}
        <div className="card">
          <h2 className="text-lg font-semibold text-primary mb-4">Информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Название *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder="Введите название плейбла"
                required
                disabled={isUploading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Версия
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="input"
                placeholder="1.0.0"
                disabled={isUploading}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-secondary mb-2">
              Папка
            </label>
            <input
              type="text"
              value={formData.folder}
              onChange={(e) => setFormData(prev => ({ ...prev, folder: e.target.value }))}
              className="input"
              placeholder="Оставьте пустым или введите название папки"
              disabled={isUploading}
            />
            <p className="text-xs text-quaternary mt-1">
              Папки помогают организовать плейблы по проектам или версиям
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={!selectedFile || !formData.name || isUploading}
          >
            {isUploading ? (
              <>
                <div className="loading-spinner w-4 h-4" />
                Загружаем...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Загрузить плейбл
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadTab;