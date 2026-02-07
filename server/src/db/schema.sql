-- Rodeos table
CREATE TABLE IF NOT EXISTS rodeos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  unique_link VARCHAR(255) UNIQUE NOT NULL,
  created_by VARCHAR(255),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'draft')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rodeo_id UUID NOT NULL REFERENCES rodeos(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  duration INTEGER,
  spotify_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rodeo_id UUID NOT NULL REFERENCES rodeos(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  user_ip VARCHAR(45),
  user_session_id VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rodeos_unique_link ON rodeos(unique_link);
CREATE INDEX IF NOT EXISTS idx_songs_rodeo_id ON songs(rodeo_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rodeo_id ON ratings(rodeo_id);
CREATE INDEX IF NOT EXISTS idx_ratings_song_id ON ratings(song_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_session ON ratings(user_session_id, rodeo_id);
