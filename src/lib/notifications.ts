// Epic 6: Notifications

export type NotificationType =
  | 'suggestion_pending'
  | 'rule_triggered'
  | 'budget_exceeded'
  | 'sync_error'
  | 'alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export async function createNotification(
  supabase: any,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    data,
    read: false,
  });

  if (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

export async function markAsRead(supabase: any, notificationId: string) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
}
