import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rodeoAPI, songAPI, ratingAPI } from '../lib/api';
import { useSessionId } from '../hooks/useSessionId';
import { SongCard } from '../components/SongCard';
import { Song, Rating } from '../types';
import { format, differenceInSeconds } from 'date-fns';

export const RodeoVote: React.FC = () => {
  const { link } = useParams<{ link: string }>();
  const navigate = useNavigate();
  const sessionId = useSessionId();
  
  const [rodeo, setRodeo] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const loadRodeo = async () => {
      try {
        if (!link) {
          setError('Invalid rodeo link');
          return;
        }

        const response = await rodeoAPI.getByLink(link);
        setRodeo(response.data);
        setSongs(response.data.songs || []);

        // Load user's existing ratings
        if (sessionId) {
          const ratingsResponse = await ratingAPI.getUserRatings(response.data.id, sessionId);
          const ratings: Record<string, number> = {};
          ratingsResponse.data.forEach((r: Rating) => {
            ratings[r.song_id] = r.rating;
          });
          setUserRatings(ratings);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load rodeo');
      } finally {
        setLoading(false);
      }
    };

    loadRodeo();
  }, [link, sessionId]);

  // Update time remaining
  useEffect(() => {
    const updateTime = () => {
      if (rodeo && rodeo.end_date) {
        const seconds = differenceInSeconds(new Date(rodeo.end_date), new Date());
        if (seconds <= 0) {
          setTimeRemaining('Voting closed');
        } else {
          const days = Math.floor(seconds / 86400);
          const hours = Math.floor((seconds % 86400) / 3600);
          const mins = Math.floor((seconds % 3600) / 60);
          setTimeRemaining(`${days}d ${hours}h ${mins}m remaining`);
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [rodeo]);

  const handleRate = async (songId: string, rating: number) => {
    if (!sessionId || !rodeo) return;

    setSubmitting(prev => ({ ...prev, [songId]: true }));
    try {
      await ratingAPI.submit({
        rodeo_id: rodeo.id,
        song_id: songId,
        rating,
        user_session_id: sessionId,
      });

      setUserRatings(prev => ({
        ...prev,
        [songId]: rating,
      }));

      // Update song data
      setSongs(songs.map(song => 
        song.id === songId 
          ? {
              ...song,
              average_rating: (
                ((song.average_rating || 0) * (song.total_votes || 0) + rating) / 
                ((song.total_votes || 0) + 1)
              ),
              total_votes: (song.total_votes || 0) + 1,
            }
          : song
      ));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setSubmitting(prev => ({ ...prev, [songId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rodeo...</p>
        </div>
      </div>
    );
  }

  if (error || !rodeo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Rodeo not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{rodeo.name}</h1>
          <p className="text-lg text-gray-600">Rate these songs from 1 to 5 stars</p>
          
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="text-gray-600">Start: {format(new Date(rodeo.start_date), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <p className="text-gray-600">End: {format(new Date(rodeo.end_date), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <p className={`font-semibold ${timeRemaining === 'Voting closed' ? 'text-red-600' : 'text-green-600'}`}>
                {timeRemaining}
              </p>
            </div>
          </div>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No songs available for this rodeo yet.</p>
          </div>
        ) : (
          <div>
            {songs.map(song => (
              <SongCard
                key={song.id}
                song={{ ...song, userRating: userRatings[song.id] }}
                onRate={(rating) => handleRate(song.id, rating)}
                isLoading={submitting[song.id]}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
