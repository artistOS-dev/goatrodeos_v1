export interface Rodeo {
  id: string;
  name: string;
  unique_link: string;
  created_by?: string;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'ended' | 'draft';
  created_at: Date;
  updated_at: Date;
}

export interface Song {
  id: string;
  rodeo_id: string;
  title: string;
  artist?: string;
  duration?: number;
  spotify_url?: string;
  youtube_url?: string;
  created_at: Date;
}

export interface Rating {
  id: string;
  rodeo_id: string;
  song_id: string;
  user_session_id: string;
  rating: number;
  created_at: Date;
}

export interface SongWithRatings extends Song {
  ratings?: Rating[];
  average_rating?: number;
  total_votes?: number;
}
