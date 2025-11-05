import { useState, useEffect } from 'react';
import { adminService, AdminStats } from '@/services/adminService';
import { Post } from '@/types';
import { useAuth } from '@/template';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdmin = async () => {
    const { isAdmin: admin, error } = await adminService.checkIsAdmin();
    if (!error) {
      setIsAdmin(admin);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await adminService.getStats();
    if (err) {
      setError(err);
    } else {
      setStats(data);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await adminService.getAllUsers();
    if (err) {
      setError(err);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const deletePost = async (postId: string) => {
    const { error: err } = await adminService.deletePost(postId);
    if (err) {
      setError(err);
      return false;
    }
    return true;
  };

  return {
    isAdmin,
    stats,
    users,
    loading,
    error,
    loadStats,
    loadUsers,
    deletePost,
  };
}
