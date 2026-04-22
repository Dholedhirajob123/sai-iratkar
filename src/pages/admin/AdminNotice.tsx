import { useState, useEffect } from 'react';
import { Megaphone, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../Config';

interface Notice {
  id: number;
  message: string;
  active: boolean;
}

const AdminNotice = () => {
  const [message, setMessage] = useState('');
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch current notice on mount
  useEffect(() => {
    fetchNotice();
  }, []);

  const fetchNotice = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/public/notice`);
      if (response.ok) {
        const data: Notice | null = await response.json();
        if (data) {
          setMessage(data.message);
          setActive(data.active);
        } else {
          setMessage('');
          setActive(false);
        }
      } else {
        throw new Error('Failed to fetch notice');
      }
    } catch (err) {
      setError('Could not load current notice. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload: Notice = {
        id: 1,
        message: message.trim(),
        active,
      };

      const response = await fetch(`${API_BASE_URL}/admin/notice/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Added Bearer Token
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('Notice updated successfully!');
        await fetchNotice();
        setTimeout(() => setSuccess(''), 3000);
      } else if (response.status === 401) {
        setError('Unauthorized. Please login again.');
      } else if (response.status === 403) {
        setError('Access denied. Admin only.');
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setError('Failed to update notice. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-mono font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" />
          Notice Management
        </h1>
        <p className="text-sm font-mono text-gray-500 mt-1">
          Manage the single announcement shown to users
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold text-gray-600">Status:</span>
              {active ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-mono font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  Active (visible to users)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono font-semibold">
                  <EyeOff className="w-3.5 h-3.5" />
                  Inactive (hidden from users)
                </span>
              )}
            </div>
            {loading && (
              <div className="text-sm text-gray-500 font-mono">Loading...</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-mono font-semibold text-gray-700 mb-2">
              Notice Message
            </label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
              placeholder="Enter the announcement message..."
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be shown to all users when active.
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                active ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              disabled={loading}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm font-mono text-gray-700">
              {active ? 'Notice is active and visible to users' : 'Notice is inactive and hidden'}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-mono">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-mono">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-mono text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Notice'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-gray-400 font-mono">
        Only one notice can exist at a time. When active, it will be shown to all users.
      </div>
    </div>
  );
};

export default AdminNotice;