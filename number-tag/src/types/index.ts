export type NumberCategory = 'sports' | 'study' | 'food' | 'hobby' | 'friends' | 'other';

export const CATEGORY_LABELS: Record<NumberCategory, string> = {
  sports: 'スポーツ',
  study: '勉強',
  food: '食べ物',
  hobby: '趣味',
  friends: '友達',
  other: 'その他',
};

export const CATEGORY_ICONS: Record<NumberCategory, string> = {
  sports: '⚽',
  study: '📚',
  food: '🍜',
  hobby: '🎮',
  friends: '👥',
  other: '✨',
};

export const COLOR_PRESETS = [
  '#7c3aed', // violet
  '#2563eb', // blue
  '#0891b2', // cyan
  '#059669', // emerald
  '#65a30d', // lime
  '#d97706', // amber
  '#ea580c', // orange
  '#dc2626', // red
  '#db2777', // pink
  '#7c3aed', // purple
  '#374151', // gray
  '#1e293b', // slate
];

export interface UserProfile {
  id: string;
  nickname: string;
  grade: number | null;
  class: string | null;
  face_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NumberEntry {
  id: string;
  user_id: string;
  number_value: number;
  meaning: string | null;
  category: NumberCategory;
  color: string;
  display_level: 1 | 2 | 3 | 4;
  is_public: boolean;
  event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NumberInput {
  number_value: number;
  meaning: string | null;
  category: NumberCategory;
  color: string;
  display_level: 1 | 2 | 3 | 4;
  is_public: boolean;
  event_id: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
}

export interface QrSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface UserWithNumber {
  profile: UserProfile;
  number: NumberEntry;
}

// display_level に応じて公開すべき情報を返す
export interface PublicNumberData {
  number_value: number;
  color: string;
  nickname?: string;
  category?: NumberCategory;
  meaning?: string | null;
  user_id: string;
}
