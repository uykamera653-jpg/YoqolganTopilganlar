import { getSupabaseClient } from '@/template';
import { Report, ReportFormData } from '@/types';

const supabase = getSupabaseClient();

export const reportService = {
  /**
   * Submit a report for a post
   */
  async submitReport(reportData: ReportFormData): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('reports')
        .insert({
          post_id: reportData.post_id,
          reporter_id: user.id,
          reason: reportData.reason,
          category: reportData.category,
          status: 'pending',
        });

      if (error) {
        console.error('[Report Service] Submit error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('[Report Service] Submit exception:', err);
      return { success: false, error: (err as Error).message };
    }
  },

  /**
   * Get all reports (admin only)
   */
  async getAllReports(): Promise<{ data: Report[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          posts (title, type),
          user_profiles (username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Report Service] Get all reports error:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Report[], error: null };
    } catch (err) {
      console.error('[Report Service] Get all reports exception:', err);
      return { data: null, error: (err as Error).message };
    }
  },

  /**
   * Get reports by status (admin only)
   */
  async getReportsByStatus(status: string): Promise<{ data: Report[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          posts (title, type),
          user_profiles (username)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Report Service] Get reports by status error:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Report[], error: null };
    } catch (err) {
      console.error('[Report Service] Get reports by status exception:', err);
      return { data: null, error: (err as Error).message };
    }
  },

  /**
   * Update report status (admin only)
   */
  async updateReportStatus(
    reportId: string,
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed',
    adminNote?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const updateData: any = { status };
      if (adminNote) {
        updateData.admin_note = adminNote;
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) {
        console.error('[Report Service] Update status error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('[Report Service] Update status exception:', err);
      return { success: false, error: (err as Error).message };
    }
  },

  /**
   * Delete a report (admin only)
   */
  async deleteReport(reportId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('[Report Service] Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('[Report Service] Delete exception:', err);
      return { success: false, error: (err as Error).message };
    }
  },

  /**
   * Check if user has already reported a post
   */
  async hasUserReported(postId: string): Promise<{ hasReported: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { hasReported: false, error: null };
      }

      const { data, error } = await supabase
        .from('reports')
        .select('id')
        .eq('post_id', postId)
        .eq('reporter_id', user.id)
        .limit(1);

      if (error) {
        console.error('[Report Service] Check report error:', error);
        return { hasReported: false, error: error.message };
      }

      return { hasReported: (data && data.length > 0), error: null };
    } catch (err) {
      console.error('[Report Service] Check report exception:', err);
      return { hasReported: false, error: (err as Error).message };
    }
  },
};
