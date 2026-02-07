import React, { useState, useEffect } from 'react';
import { rodeoAPI, ratingAPI } from '../lib/api';
import { Rodeo, Song } from '../types';
import { format } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const [rodeos, setRodeos] = useState<Rodeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRodeo, setSelectedRodeo] = useState<Rodeo | null>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });
  const [songFormData, setSongFormData] = useState({
    title: '',
    artist: '',
    duration: '',
    spotify_url: '',
    youtube_url: '',
  });

  useEffect(() => {
    loadRodeos();
  }, []);

  const loadRodeos = async () => {
    try {
      setLoading(true);
      const response = await rodeoAPI.getAll();
      setRodeos(response.data);
    } catch (error) {
      console.error('Failed to load rodeos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRodeoDetails = async (rodeo: Rodeo) => {
    try {
      const response = await rodeoAPI.getById(rodeo.id);
      setSongs(response.data.songs || []);
      const statsResponse = await ratingAPI.getStats(rodeo.id);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load rodeo details:', error);
    }
  };

  const handleCreateRodeo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await rodeoAPI.create({
        ...formData,
        created_by: 'admin',
      });
      setRodeos([...rodeos, result.data]);
      setFormData({ name: '', start_date: '', end_date: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create rodeo:', error);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRodeo) return;

    try {
      const result = await rodeoAPI.getById(selectedRodeo.id);
      const response = await fetch(`/api/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rodeo_id: selectedRodeo.id,
          ...songFormData,
          duration: songFormData.duration ? parseInt(songFormData.duration) : null,
        }),
      });
      const newSong = await response.json();
      setSongs([...songs, newSong]);
      setSongFormData({
        title: '',
        artist: '',
        duration: '',
        spotify_url: '',
        youtube_url: '',
      });
      setShowAddSongForm(false);
    } catch (error) {
      console.error('Failed to add song:', error);
    }
  };

  const handleSelectRodeo = (rodeo: Rodeo) => {
    setSelectedRodeo(rodeo);
    loadRodeoDetails(rodeo);
    setShowAddSongForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-6 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
        >
          {showCreateForm ? 'Cancel' : 'Create New Rodeo'}
        </button>

        {showCreateForm && (
          <form onSubmit={handleCreateRodeo} className="mb-8 bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Create New Rodeo</h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Rodeo Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded bg-gray-50"
                required
              />
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="px-4 py-2 border rounded bg-gray-50"
                required
              />
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="px-4 py-2 border rounded bg-gray-50"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
              >
                Create Rodeo
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rodeos List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Rodeos</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : (
                <div className="space-y-2">
                  {rodeos.map(rodeo => (
                    <button
                      key={rodeo.id}
                      onClick={() => handleSelectRodeo(rodeo)}
                      className={`w-full text-left px-4 py-3 rounded border-2 transition ${
                        selectedRodeo?.id === rodeo.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{rodeo.name}</p>
                      <p className="text-xs text-gray-500">{rodeo.unique_link}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rodeo Details */}
          <div className="lg:col-span-2">
            {selectedRodeo ? (
              <div className="space-y-6">
                {/* Share Link */}
                <div className="bg-white rounded shadow p-6">
                  <h3 className="text-xl font-bold mb-4">Voting Link</h3>
                  <div className="bg-gray-50 p-4 rounded text-sm break-all font-mono">
                    {`${window.location.origin}/vote/${selectedRodeo.unique_link}`}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/vote/${selectedRodeo.unique_link}`
                      );
                      alert('Link copied!');
                    }}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Copy Link
                  </button>
                </div>

                {/* Add Song */}
                <div className="bg-white rounded shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Songs ({songs.length})</h3>
                    <button
                      onClick={() => setShowAddSongForm(!showAddSongForm)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      {showAddSongForm ? 'Cancel' : 'Add Song'}
                    </button>
                  </div>

                  {showAddSongForm && (
                    <form onSubmit={handleAddSong} className="mb-6 p-4 bg-gray-50 rounded border-2 border-gray-200">
                      <input
                        type="text"
                        placeholder="Song Title"
                        value={songFormData.title}
                        onChange={(e) => setSongFormData({ ...songFormData, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded mb-2 bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Artist"
                        value={songFormData.artist}
                        onChange={(e) => setSongFormData({ ...songFormData, artist: e.target.value })}
                        className="w-full px-3 py-2 border rounded mb-2 bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Duration (seconds)"
                        value={songFormData.duration}
                        onChange={(e) => setSongFormData({ ...songFormData, duration: e.target.value })}
                        className="w-full px-3 py-2 border rounded mb-2 bg-white"
                      />
                      <button
                        type="submit"
                        className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Add Song
                      </button>
                    </form>
                  )}

                  {songs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No songs added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {songs.map(song => (
                        <div key={song.id} className="p-3 border rounded hover:bg-gray-50">
                          <p className="font-semibold">{song.title}</p>
                          {song.artist && <p className="text-sm text-gray-600">{song.artist}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Statistics */}
                {stats.length > 0 && (
                  <div className="bg-white rounded shadow p-6">
                    <h3 className="text-xl font-bold mb-4">Results</h3>
                    <div className="space-y-3">
                      {stats.map(stat => (
                        <div key={stat.id} className="p-3 border rounded">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{stat.title}</p>
                              <p className="text-sm text-gray-600">{stat.artist}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-yellow-500">
                                {stat.average_rating ? stat.average_rating.toFixed(1) : 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">{stat.total_votes} votes</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded shadow p-6 text-center text-gray-500">
                <p>Select a rodeo to manage</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
