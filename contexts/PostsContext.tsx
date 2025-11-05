import { createContext, useState, useEffect, ReactNode } from 'react';
import { Post, PostFormData } from '@/types';
import { postService } from '@/services/postService';
import { useAuth } from '@/template';

interface PostsContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refreshPosts: () => Promise<void>;
  createPost: (postData: PostFormData) => Promise<{ success: boolean; error: string | null }>;
  deletePost: (id: string) => Promise<{ success: boolean; error: string | null }>;
}

export const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await postService.fetchPosts();
    
    if (err) {
      setError(err);
    } else if (data) {
      setPosts(data);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, [user]);

  const refreshPosts = async () => {
    await loadPosts();
  };

  const createPost = async (postData: PostFormData) => {
    const { data, error: err } = await postService.createPost(postData);
    
    if (err) {
      return { success: false, error: err };
    }
    
    if (data) {
      setPosts(prev => [data, ...prev]);
    }
    
    return { success: true, error: null };
  };

  const deletePost = async (id: string) => {
    const { error: err } = await postService.deletePost(id);
    
    if (err) {
      return { success: false, error: err };
    }
    
    setPosts(prev => prev.filter(post => post.id !== id));
    return { success: true, error: null };
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        refreshPosts,
        createPost,
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}
