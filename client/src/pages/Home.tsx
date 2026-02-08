import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [rodeoLink, setRodeoLink] = React.useState('');

  const handleJoinRodeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (rodeoLink.trim()) {
      navigate(`/vote/${rodeoLink.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">🎵 GoatRodeos</h1>
        <p className="text-center text-gray-600 mb-8">Rate songs with your friends!</p>

        <form onSubmit={handleJoinRodeo} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Rodeo Link
            </label>
            <input
              type="text"
              placeholder="e.g., rodeo-abc12345"
              value={rodeoLink}
              onChange={(e) => setRodeoLink(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
          >
            Join Rodeo
          </button>
        </form>

        <div className="border-t pt-6">
          <p className="text-center text-sm text-gray-600 mb-4">Are you a rodeo master?</p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition mb-3"
          >
            Go to Admin Dashboard
          </button>
          <button
            onClick={() => navigate('/db-diagnostic')}
            className="w-full py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition text-sm"
          >
            🔧 Database Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
};
