// Types for Notification System

export type NotificationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  is_read: boolean;
  target_type?: string;
  target_id?: string;
  action_url?: string;
  created_at: string;
}

export interface NotificationListResponse {
  total: number;
  items: NotificationItem[];
}

export interface NotificationStats {
  unread_count: number;
  total_count: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message?: string;
  updated_count?: number;
}
