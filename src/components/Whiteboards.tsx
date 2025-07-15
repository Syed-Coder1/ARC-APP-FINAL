import React, { useState } from 'react';
import { Plus, Grid, Search, Filter, Eye, Star, StarOff, Share, Download, Trash2, MapPin, FileText, Edit, Copy } from 'lucide-react';
import { useWhiteboards } from '../hooks/useWhiteboards';
import { WhiteboardEditor } from './WhiteboardEditor';
import { format } from 'date-fns';
import clsx from 'clsx';

export function Whiteboards() {
  const {
    whiteboards,
    templates,
    createWhiteboard,
    updateWhiteboard,
    deleteWhiteboard,
    toggleFavorite,
    loading
  } = useWhiteboards();

  const [view, setView] = useState<'management' | 'editor'>('management');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWhiteboardName, setNewWhiteboardName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const handleCreateWhiteboard = async (templateId?: string) => {
    const template = templates.find(t => t.id === templateId) || templates[0];
    const name = newWhiteboardName.trim() || `Whiteboard ${whiteboards.length + 1}`;
    
    const newBoard = await createWhiteboard({
      name,
      location: 'My Whiteboards',
      template: template.id,
      isFavorite: false,
      createdBy: 'current-user',
      content: {
        ...template.content,
        elements: []
      }
    });
    
    setSelectedId(newBoard.id);
    setView('editor');
    setShowCreateModal(false);
    setNewWhiteboardName('');
  };

  const handleOpen = async (id: string) => {
    setSelectedId(id);
    setView('editor');
    const wb = whiteboards.find(w => w.id === id);
    if (wb) await updateWhiteboard({ ...wb, lastViewedAt: new Date() });
  };

  const handleDuplicate = async (whiteboard: any) => {
    const newBoard = await createWhiteboard({
      name: `${whiteboard.name} (Copy)`,
      location: whiteboard.location,
      template: whiteboard.template,
      isFavorite: false,
      createdBy: 'current-user',
      content: whiteboard.content
    });
    
    // Optionally open the duplicated whiteboard
    setSelectedId(newBoard.id);
    setView('editor');
  };

  const handleExport = (whiteboard: any) => {
    const dataStr = JSON.stringify(whiteboard, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${whiteboard.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtered = whiteboards.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'favorites' && w.isFavorite) ||
      (filter === 'recent' && new Date().getTime() - new Date(w.lastViewedAt).getTime() < 604800000);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (view === 'editor' && selectedId) {
    const wb = whiteboards.find(w => w.id === selectedId);
    if (!wb) return <div className="text-red-500 p-4">Whiteboard not found</div>;
    return (
      <WhiteboardEditor
        whiteboard={wb}
        onSave={updateWhiteboard}
        onClose={() => {
          setSelectedId(null);
          setView('management');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Whiteboards</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage your digital whiteboards with advanced drawing tools
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors gap-2"
          >
            <Grid size={16} /> Templates
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors gap-2"
          >
            <Plus size={16} /> New Whiteboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 text-gray-400 dark:text-gray-500" size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search whiteboards..."
            />
          </div>
          <div className="relative">
            <Filter className="absolute top-2.5 left-3 text-gray-400 dark:text-gray-500" size={16} />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Whiteboards</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recent (Last 7 days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Whiteboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(w => (
          <div
            key={w.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 group"
          >
            {/* Preview Area */}
            <div 
              className="h-32 bg-gray-50 dark:bg-gray-700 rounded-t-xl cursor-pointer relative overflow-hidden"
              onClick={() => handleOpen(w.id)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              {w.isFavorite && (
                <Star size={16} className="absolute top-2 right-2 text-yellow-500 fill-current" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                  {w.name}
                </h3>
                <button
                  onClick={() => toggleFavorite(w.id)}
                  className="ml-2 text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  {w.isFavorite ? <Star size={16} className="fill-current text-yellow-500" /> : <StarOff size={16} />}
                </button>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <MapPin size={12} className="mr-1" />
                {w.location}
              </div>
              
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                Updated {format(new Date(w.updatedAt), 'MMM dd, yyyy')}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpen(w.id)}
                  className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  Open
                </button>
                <button
                  onClick={() => handleDuplicate(w)}
                  className="bg-gray-600 dark:bg-gray-700 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => handleExport(w)}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
                  title="Export"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => deleteWhiteboard(w.id)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No whiteboards found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {search ? 'Try adjusting your search terms' : 'Create your first whiteboard to get started'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Whiteboard
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Whiteboard</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Whiteboard Name
                </label>
                <input
                  type="text"
                  value={newWhiteboardName}
                  onChange={(e) => setNewWhiteboardName(e.target.value)}
                  placeholder="Enter whiteboard name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateWhiteboard(selectedTemplate)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Choose a Template</h2>
              <button 
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setShowTemplates(false);
                    setShowCreateModal(true);
                  }}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all duration-200 hover:border-blue-500"
                >
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded mb-3 flex items-center justify-center">
                    <FileText size={32} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}