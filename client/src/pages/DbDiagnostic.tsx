import { useEffect, useState } from 'react';
import { rodeoAPI } from '../lib/api';
import { Rodeo } from '../types';

export function DbDiagnostic() {
  const [rodeos, setRodeos] = useState<Rodeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRodeos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await rodeoAPI.getAll();
        setRodeos(response.data);
      } catch (err: any) {
        console.error('Database connection error:', err);
        setError(
          err.response?.data?.error || 
          err.message || 
          'Failed to connect to database'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRodeos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Database Diagnostic
        </h1>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">Loading rodeos from database...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-red-900 font-semibold mb-2">
              ❌ Connection Error
            </h2>
            <p className="text-red-800 font-mono text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              ✅ Database connection successful!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Found {rodeos.length} rodeo{rodeos.length !== 1 ? 's' : ''} in the database.
            </p>
          </div>
        )}

        {!loading && rodeos.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Unique Link
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rodeos.map((rodeo) => (
                  <tr key={rodeo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {rodeo.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {rodeo.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {rodeo.unique_link}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rodeo.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : rodeo.status === 'ended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rodeo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(rodeo.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(rodeo.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {rodeo.created_by || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(rodeo.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rodeos.length === 0 && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              No rodeos found in the database. Try creating one from the admin dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
