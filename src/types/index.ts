export interface Song {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  original_key: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type SongInput = Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
