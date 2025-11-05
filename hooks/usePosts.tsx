import { useContext } from 'react';
import { PostsContext } from '@/contexts/PostsContext';

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts hook faqat PostsProvider ichida ishlatilishi kerak');
  }
  return context;
}
