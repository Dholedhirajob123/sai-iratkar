import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Check, X, Calendar, Clock, AlertCircle, Bell, Eye, EyeOff } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
}

const AdminNotice = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    expiresAt: '',
    isActive: true
  });

  useEffect(() => {
    const savedNotices = localStorage.getItem('admin_notices');
    if (savedNotices) {
      setNotices(JSON.parse(savedNotices));
    } else {
      const sampleNotices: Notice[] = [
        {
          id: '1',
          title: 'Welcome to Admin Panel',
          content: 'You can now manage notices from this panel. Create announcements for users!',
          type: 'success',
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: 'Admin'
        },
        {
          id: '2',
          title: 'System Maintenance',
          content: 'The system will be under maintenance on Sunday from 2 AM to 4 AM.',
          type: 'warning',
          isActive: true,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'Admin'
        }
      ];
      setNotices(sampleNotices);
      localStorage.setItem('admin_notices', JSON.stringify(sampleNotices));
    }
  }, []);

  const saveNotices = (updatedNotices: Notice[]) => {
    setNotices(updatedNotices);
    localStorage.setItem('admin_notices', JSON.stringify(updatedNotices));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNotice) {
      const updatedNotices = notices.map(notice =>
        notice.id === editingNotice.id
          ? { ...notice, ...formData, updatedAt: new Date().toISOString() }
          : notice
      );
      saveNotices(updatedNotices);
    } else {
      const newNotice: Notice = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin'
      };
      saveNotices([newNotice, ...notices]);
    }
    
    resetForm();
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      expiresAt: notice.expiresAt || '',
      isActive: notice.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      const updatedNotices = notices.filter(notice => notice.id !== id);
      saveNotices(updatedNotices);
    }
  };

  const toggleActive = (id: string) => {
    const updatedNotices = notices.map(notice =>
      notice.id === id ? { ...notice, isActive: !notice.isActive } : notice
    );
    saveNotices(updatedNotices);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      expiresAt: '',
      isActive: true
    });
  };

  const getTypeStyles = (type: string) => {
    const styles = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      danger: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      info: <AlertCircle className="w-4 h-4" />,
      warning: <AlertCircle className="w-4 h-4" />,
      success: <Check className="w-4 h-4" />,
      danger: <X className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || icons.info;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-mono font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-600" />
            Notice Management
          </h1>
          <p className="text-sm font-mono text-gray-500 mt-1">Create and manage announcements for users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-mono text-sm font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Notice
        </button>
      </div>

    

      {/* Notices Grid */}
      <div className="grid gap-4">
        {notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-mono">No notices created yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 font-mono text-sm hover:underline"
            >
              Create your first notice
            </button>
          </div>
        ) : (
          notices.map((notice) => {
            const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date();
            
            return (
              <div
                key={notice.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  notice.isActive && !isExpired 
                    ? 'border-gray-200 shadow-sm hover:shadow-md' 
                    : 'border-gray-100 opacity-70'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-mono font-semibold ${getTypeStyles(notice.type)}`}>
                          {getTypeIcon(notice.type)}
                          <span className="uppercase">{notice.type}</span>
                        </div>
                        {!notice.isActive && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono">
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                        {isExpired && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-mono">
                            <AlertCircle className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                        {notice.isActive && !isExpired && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-mono">
                            <Eye className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-mono font-bold text-gray-900 mb-2">
                        {notice.title}
                      </h3>
                      
                      <p className="text-gray-600 font-mono text-sm mb-3">
                        {notice.content}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created: {new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notice.createdAt).toLocaleTimeString()}</span>
                        </div>
                        {notice.expiresAt && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Megaphone className="w-3 h-3" />
                          <span>By: {notice.createdBy}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(notice.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          notice.isActive && !isExpired
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={notice.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {getStatusIcon(notice.isActive)}
                      </button>
                      <button
                        onClick={() => handleEdit(notice)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-mono font-bold text-gray-900">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-mono font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter notice title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter notice content"
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono font-semibold text-gray-700 mb-2">
                  Notice Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                >
                  <option value="info">ℹ️ Information - General announcement</option>
                  <option value="warning">⚠️ Warning - Important alert</option>
                  <option value="success">✅ Success - Positive update</option>
                  <option value="danger">🔴 Danger - Critical alert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-mono font-semibold text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-mono text-gray-700">
                  Active (visible to users)
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-mono text-sm font-semibold hover:shadow-lg transition-all"
                >
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-mono text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotice;