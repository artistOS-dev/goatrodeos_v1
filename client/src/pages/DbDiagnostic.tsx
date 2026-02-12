import { useEffect, useState } from 'react';
import { diagnosticAPI, rodeoAPI } from '../lib/api';
import { Rodeo } from '../types';

interface DiagnosticResponse {
  [key: string]: any;
}

interface EndpointResult {
  success: boolean;
  status: number | null;
  message: string;
}

function renderValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value, null, 2);
}

function flattenObject(
  input: Record<string, any>,
  prefix = '',
  result: Array<{ key: string; value: any }> = []
): Array<{ key: string; value: any }> {
  Object.entries(input).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      flattenObject(value, fullKey, result);
      return;
    }

    result.push({ key: fullKey, value });
  });

  return result;
}

export function DbDiagnostic() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [rodeos, setRodeos] = useState<Rodeo[]>([]);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [requestMs, setRequestMs] = useState<number | null>(null);
  const [endpointResults, setEndpointResults] = useState<Record<string, EndpointResult>>({});

  useEffect(() => {
    const fetchData = async () => {
      const startedAt = performance.now();
      setConnectionAttempted(true);
      setError(null);

      const diagPromise = diagnosticAPI.check();
      const rodeoPromise = rodeoAPI.getAll();
      const [diagResult, rodeoResult] = await Promise.allSettled([diagPromise, rodeoPromise]);

      const results: Record<string, EndpointResult> = {};
      const errors: Array<Record<string, any>> = [];

      if (diagResult.status === 'fulfilled') {
        setDiagnostic(diagResult.value.data);
        results.diagnostic = {
          success: true,
          status: diagResult.value.status,
          message: 'Diagnostic endpoint returned data',
        };
      } else {
        const err: any = diagResult.reason;
        const responsePayload = err.response?.data;
        setDiagnostic(responsePayload || null);

        results.diagnostic = {
          success: false,
          status: err.response?.status || null,
          message: err.message || 'Diagnostic request failed',
        };

        errors.push({
          endpoint: '/diagnostic',
          message: err.message || 'Unknown client error',
          code: err.code || null,
          status: err.response?.status || null,
          statusText: err.response?.statusText || null,
          method: err.config?.method || null,
          url: err.config?.url || null,
          baseURL: err.config?.baseURL || null,
          timeout: err.config?.timeout || null,
          responseData: responsePayload || null,
        });
      }

      if (rodeoResult.status === 'fulfilled') {
        setRodeos(rodeoResult.value.data);
        results.rodeos = {
          success: true,
          status: rodeoResult.value.status,
          message: `Rodeos endpoint returned ${rodeoResult.value.data.length} rows`,
        };
      } else {
        const err: any = rodeoResult.reason;
        results.rodeos = {
          success: false,
          status: err.response?.status || null,
          message: err.message || 'Rodeos request failed',
        };

        errors.push({
          endpoint: '/rodeos',
          message: err.message || 'Unknown client error',
          code: err.code || null,
          status: err.response?.status || null,
          statusText: err.response?.statusText || null,
          method: err.config?.method || null,
          url: err.config?.url || null,
          baseURL: err.config?.baseURL || null,
          timeout: err.config?.timeout || null,
          responseData: err.response?.data || null,
        });
      }

      setEndpointResults(results);
      if (errors.length > 0) {
        setError(JSON.stringify(errors, null, 2));
      }

      setRequestMs(Number((performance.now() - startedAt).toFixed(2)));
      setLoading(false);
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, []);

  const diagnosticEntries = diagnostic ? flattenObject(diagnostic) : [];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Database Diagnostic</h1>
        <p className="text-gray-600 mb-8">
          Deep DB connectivity diagnostics with detailed runtime, config, and error output.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">📡 Client Runtime & Request Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="text-sm text-gray-600">API Base URL</p>
              <p className="text-sm font-mono font-semibold text-gray-900 break-all">{API_URL}</p>
            </div>
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="text-sm text-gray-600">Environment Mode</p>
              <p className="text-sm font-mono font-semibold text-gray-900">{import.meta.env.MODE}</p>
            </div>
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="text-sm text-gray-600">Browser User Agent</p>
              <p className="text-xs font-mono text-gray-900 break-all">{navigator.userAgent}</p>
            </div>
            <div className="bg-white p-4 rounded border border-blue-100">
              <p className="text-sm text-gray-600">Request Elapsed Time</p>
              <p className="text-sm font-mono font-semibold text-gray-900">
                {requestMs === null ? 'pending...' : `${requestMs} ms`}
              </p>
            </div>
          </div>
        </div>

        {!loading && Object.keys(endpointResults).length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">🧪 Endpoint Reachability Checks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(endpointResults).map(([key, value]) => (
                <div key={key} className="bg-white p-4 rounded border border-indigo-100">
                  <p className="text-sm text-gray-600">{key}</p>
                  <p className={`text-sm font-semibold ${value.success ? 'text-green-700' : 'text-red-700'}`}>
                    {value.success ? 'success' : 'failed'}
                  </p>
                  <p className="text-xs font-mono text-gray-700">status: {value.status ?? 'none'}</p>
                  <p className="text-xs text-gray-700">{value.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && connectionAttempted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">⏳</div>
              <div>
                <p className="text-yellow-900 font-semibold">Running deep diagnostic probe...</p>
                <p className="text-yellow-700 text-sm mt-1">Attempting to connect via {API_URL}/diagnostic</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-red-900 font-semibold mb-3">❌ Connection / Endpoint Requests Failed</h2>
            <div className="bg-white p-4 rounded border border-red-100 mb-3">
              <p className="text-sm text-gray-600 mb-1">Detailed Client Error Object</p>
              <pre className="text-red-800 font-mono text-xs break-all whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        )}

        {!loading && diagnosticEntries.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">📊 Full Diagnostic Payload</h2>
            <p className="text-sm text-purple-700 mb-4">
              Every value returned by the server diagnostic endpoint is shown below to maximize debugging visibility.
            </p>
            <div className="overflow-x-auto bg-white rounded border border-purple-100">
              <table className="w-full">
                <thead className="bg-purple-100/60 border-b border-purple-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-purple-900">Key</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-purple-900">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticEntries.map((entry) => (
                    <tr key={entry.key} className="border-b border-gray-100 align-top">
                      <td className="px-4 py-2 text-xs font-mono text-gray-800">{entry.key}</td>
                      <td className="px-4 py-2 text-xs font-mono text-gray-900 whitespace-pre-wrap break-all">
                        {renderValue(entry.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && rodeos.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unique Link</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created By</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rodeos.map((rodeo) => (
                  <tr key={rodeo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{rodeo.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{rodeo.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rodeo.unique_link}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rodeo.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : rodeo.status === 'ended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {rodeo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(rodeo.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(rodeo.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rodeo.created_by || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(rodeo.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rodeos.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              No rodeos returned from API. Use the endpoint checks above to verify whether this is a DB issue or only diagnostic endpoint issue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
