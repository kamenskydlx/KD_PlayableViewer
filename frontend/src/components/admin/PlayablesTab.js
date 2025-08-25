import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  FolderOpen,
  ExternalLink,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { playablesAPI } from '../../utils/api';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const PlayablesTab = () => {
  const [playables, setPlayables] = useState([]);
  const [filteredPlayables, setFilteredPlayables] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [editingPlayable, setEditingPlayable] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadPlayables();
  }, []);

  useEffect(() => {
    filterPlayables();
  }, [playables, searchTerm, selectedFolder]);

  const loadPlayables = async () => {
    try {
      setIsLoading(true);
      const data = await playablesAPI.getAll();
      const playablesArray = Object.values(data.playables);
      setPlayables(playablesArray);
      setFolders(['all', ...data.folders]);
    } catch (error) {
      toast.error('Не удалось загрузить плейблы');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPlayables = () => {
    let filtered = playables;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(playable =>
        playable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playable.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (playable.folder && playable.folder.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by folder
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(playable => playable.folder === selectedFolder);
    }

    setFilteredPlayables(filtered);
  };

  const handleDelete = async (playable) => {
    try {
      await playablesAPI.delete(playable.id);
      toast.success(`Плейбл "${playable.name}" удален`);
      loadPlayables();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Не удалось удалить плейбл');
    }
  };

  const handleEdit = async (playable, newData) => {
    try {
      await playablesAPI.update(playable.id, newData);
      toast.success('Плейбл обновлен');
      loadPlayables();
      setEditingPlayable(null);
    } catch (error) {
      toast.error('Не удалось обновить плейбл');
    }
  };

  const copyPlayableLink = (id) => {
    const link = `${window.location.origin}/play/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Ссылка скопирована');
  };

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Загружаем плейблы..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Плейблы</h1>
          <p className="text-tertiary">
            Управление загруженными плейблами
          </p>
        </div>
        <div className="text-sm text-quaternary">
          Всего: {filteredPlayables.length} из {playables.length}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quaternary w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск плейблов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Folder Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quaternary w-4 h-4" />
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="input pl-10 pr-8 appearance-none bg-secondary"
            >
              <option value="all">Все папки</option>
              {folders.filter(f => f !== 'all').map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Playables Grid */}
      {filteredPlayables.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPlayables.map((playable) => (
              <motion.div
                key={playable.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="card hover:shadow-lg group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary truncate">
                        {playable.name}
                      </h3>
                      <p className="text-xs text-quaternary">
                        v{playable.version}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="opacity-0 group-hover:opacity-100 transition">
                    <button className="btn btn-ghost btn-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Playable Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-tertiary">Размер:</span>
                    <span className="text-secondary">{formatFileSize(playable.size)}</span>
                  </div>
                  {playable.folder && (
                    <div className="flex justify-between text-sm">
                      <span className="text-tertiary">Папка:</span>
                      <span className="text-secondary">{playable.folder}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-tertiary">Загружен:</span>
                    <span className="text-secondary">{formatDate(playable.uploadDate)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`/play/${playable.id}`, '_blank')}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <Eye className="w-4 h-4" />
                    Открыть
                  </button>
                  <button
                    onClick={() => copyPlayableLink(playable.id)}
                    className="btn btn-secondary btn-sm"
                    title="Копировать ссылку"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingPlayable(playable)}
                    className="btn btn-secondary btn-sm"
                    title="Редактировать"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(playable)}
                    className="btn btn-danger btn-sm"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <FolderOpen className="w-16 h-16 text-quaternary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary mb-2">
            {searchTerm || selectedFolder !== 'all' ? 'Плейблы не найдены' : 'Нет плейблов'}
          </h3>
          <p className="text-tertiary mb-6">
            {searchTerm || selectedFolder !== 'all' 
              ? 'Попробуйте изменить критерии поиска'
              : 'Загрузите первый плейбл, чтобы начать работу'
            }
          </p>
          {!searchTerm && selectedFolder === 'all' && (
            <button className="btn btn-primary">
              Загрузить плейбл
            </button>
          )}
        </motion.div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPlayable && (
          <EditPlayableModal
            playable={editingPlayable}
            folders={folders.filter(f => f !== 'all')}
            onSave={handleEdit}
            onCancel={() => setEditingPlayable(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteConfirmModal
            playable={deleteConfirm}
            onConfirm={() => handleDelete(deleteConfirm)}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Edit Modal Component
const EditPlayableModal = ({ playable, folders, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: playable.name,
    version: playable.version,
    folder: playable.folder || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(playable, formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="card w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-primary mb-6">
          Редактировать плейбл
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Название
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              required
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
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Папка
            </label>
            <input
              type="text"
              value={formData.folder}
              onChange={(e) => setFormData(prev => ({ ...prev, folder: e.target.value }))}
              className="input"
              placeholder="Оставьте пустым для корневой папки"
              list="folders"
            />
            <datalist id="folders">
              {folders.map(folder => (
                <option key={folder} value={folder} />
              ))}
            </datalist>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              Сохранить
            </button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ playable, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      className="card w-full max-w-md"
      onClick={e => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold text-primary mb-4">
        Удалить плейбл?
      </h2>
      <p className="text-tertiary mb-6">
        Вы уверены, что хотите удалить плейбл "{playable.name}"? 
        Это действие нельзя отменить.
      </p>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="btn btn-danger flex-1">
          Удалить
        </button>
        <button onClick={onCancel} className="btn btn-secondary">
          Отмена
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default PlayablesTab;