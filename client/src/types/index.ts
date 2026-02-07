export interface Rodeo {
  id: string;
  name: string;
  unique_link: string;
  created_by?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'ended' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface Song {
  id: string;
  rodeo_id: string;
  title: string;
  artist?: string;
  duration?: number;
  spotify_url?: string;
  youtube_url?: string;
  created_at: string;
  total_votes?: number;
  average_rating?: number;
}

export interface Rating {
  id: string;
  rodeo_id: string;
  song_id: string;
  user_session_id: string;
  user_ip?: string;
  rating: number;
  created_at: string;
}
