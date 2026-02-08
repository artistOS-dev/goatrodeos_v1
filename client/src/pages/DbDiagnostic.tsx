import { useEffect, useState } from 'react';
import { rodeoAPI } from '../lib/api';
import { diagnosticAPI } from '../lib/api';
import { Rodeo } from '../types';

interface DiagnosticInfo {
  status: string;
  node_env: string;
  database_host: string;
  database_name: string;
  port: number;
  connection_string_masked: string;
}

export function DbDiagnostic() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [rodeos, setRodeos] = useState<Rodeo[]>([]);
  const [diagnostic, setDiagnostic] = useState<DiagnosticInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setConnectionAttempted(true);
        setError(null);
        
        // Fetch diagnostic info
        const diagResponse = await diagnosticAPI.check();
        setDiagnostic(diagResponse.data);
        
        // Fetch rodeos
        const rodeoResponse = await rodeoAPI.getAll();
        setRodeos(rodeoResponse.data);
      } catch (err: any) {
        console.error('Database connection error:', err);
        setError(
          err.response?.data?.error || 
          err.message || 
          'Failed to connect to server'
        );
      } finally {
        setLoading(false);
      }
    };

    // Small delay to show UI is loading
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔧 Database Diagnostic
        </h1>
        <p className="text-gray-600 mb-8">Test your database connection and view configuration</p>

        {/* Client-side connection info - shown immediately */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            📡 Client Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="text-sm text-gray-600">API Base URL</p>
              <p className="text-sm font-mono font-semibold text-gray-900 break-all">
                {API_URL}
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="text-sm text-gray-600">Environment</p>
              <p className="text-sm font-mono font-semibold text-gray-900">
                {import.meta.env.MODE}
              </p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && connectionAttempted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">⏳</div>
              <div>
                <p className="text-yellow-900 font-semibold">Connecting to server...</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Attempting to reach {API_URL}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-red-900 font-semibold mb-3">
              ❌ Connection Failed
            </h2>
            <div className="bg-white p-4 rounded border border-red-100 mb-3">
              <p className="text-sm text-gray-600 mb-1">Error Message</p>
              <p className="text-red-800 font-mono text-sm break-all">{error}</p>
            </div>
            <div className="bg-white p-4 rounded border border-red-100">
              <p className="text-sm text-gray-600 mb-2">Troubleshooting</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Is the server running? Try: <code className="bg-gray-100 px-1 rounded">npm run dev</code> in the server folder</li>
                <li>Check that the API URL is correct: <code className="bg-gray-100 px-1 rounded">{API_URL}</code></li>
                <li>Verify PostgreSQL is running</li>
                <li>Check the DATABASE_URL in server/.env</li>
                <li>View server logs for more details</li>
              </ul>
            </div>
          </div>
        )}

        {/* Server diagnostic info - shown when connection succeeds */}
        {!loading && diagnostic && !error && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                ✅ Server Connected Successfully
              </h2>
              <p className="text-green-700 text-sm">
                Server is responding and database connection info retrieved.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">
                📊 Server Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded border border-purple-100">
                  <p className="text-sm text-gray-600">Server Port</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {diagnostic.port}
                  </p>
                </div>
                <div className="bg-white p-4 rounded border border-purple-100">
                  <p className="text-sm text-gray-600">Environment</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {diagnostic.node_env}
                  </p>
                </div>
                <div className="bg-white p-4 rounded border border-purple-100">
                  <p className="text-sm text-gray-600">Database Host</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {diagnostic.database_host}
                  </p>
                </div>
                <div className="bg-white p-4 rounded border border-purple-100">
                  <p className="text-sm text-gray-600">Database Name</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">
                    {diagnostic.database_name}
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded border border-purple-100">
                <p className="text-sm text-gray-600 mb-2">Database Connection String (Masked)</p>
                <p className="text-sm font-mono bg-gray-900 text-green-400 p-3 rounded break-all">
                  {diagnostic.connection_string_masked}
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">
                ✅ Database connection successful!
              </p>
              <p className="text-green-700 text-sm mt-1">
                Found {rodeos.length} rodeo{rodeos.length !== 1 ? 's' : ''} in the database.
              </p>
            </div>
          </>
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
