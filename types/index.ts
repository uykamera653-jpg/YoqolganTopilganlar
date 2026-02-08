export interface Post {
  id: string;
  user_id: string;
  type: 'found' | 'lost';
  title: string;
  description: string;
  image_url?: string;
  location: string;
  region?: string;
  contact: string;
  reward?: string;
  date_occurred?: string;
  created_at: string;
  user_profiles?: {
    username: string;
    avatar_url?: string;
  };
}

export interface PostFormData {
  type: 'found' | 'lost';
  title: string;
  description: string;
  location: string;
  region?: string;
  contact: string;
  image_url?: string;
  reward?: string;
  date_occurred?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user_profiles: {
    username: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_admin: boolean;
}
