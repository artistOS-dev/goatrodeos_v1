import React from 'react';
import { Song } from '../types';
import { StarRating } from './StarRating';

interface SongCardProps {
  song: Song & { userRating?: number };
  onRate: (rating: number) => void;
  isLoading?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  onRate,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{song.title}</h3>
          {song.artist && (
            <p className="text-sm text-gray-600 mt-1">{song.artist}</p>
          )}
          {song.duration && (
            <p className="text-xs text-gray-500 mt-2">
              Duration: {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
            </p>
          )}
          
          {(song.total_votes || song.average_rating) && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-700">
                  {song.average_rating ? song.average_rating.toFixed(1) : 'No'} avg
                </span>
                <span className="text-xs text-gray-500">({song.total_votes || 0} votes)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Your rating:</p>
        <StarRating
          rating={song.userRating || 0}
          onRate={onRate}
          readonly={isLoading}
        />
      </div>
    </div>
  );
};
