/**
 * Notifications Service
 * Handles in-app, email, and push notifications
 */

export type NotificationType =
  | 'campaign_alert'
  | 'rule_executed'
  | 'suggestion_created'
  | 'performance_anomaly'
  | 'budget_alert'
  | 'sync_failed'
  | 'token_expired'
  | 'system_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  account_id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  description?: string;
  data?: Record<string, any>;
  read: boolean;
  archived: boolean;
  created_at: string;
  read_at?: string;
}

export interface ActionLog {
  id: string;
  account_id: string;
  campaign_id?: string;
  action_type: string;
  status: 'pending' | 'executing' | 'success' | 'failed';
  actor_type: 'system' | 'user' | 'rule' | 'suggestion';
  actor_id?: string;
  metadata: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  account_id: string;
  entity_type: string; // 'campaign', 'rule', 'account', etc.
  entity_id: string;
  event_type: string; // 'created', 'updated', 'deleted', 'paused', etc.
  changes: {
    before?: Record<string, any>;
    after: Record<string, any>;
  };
  user_id?: string;
  ip_address?: string;
  timestamp: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  messageTemplate: string; // Use {variable} syntax
  emailTemplate?: string;
  priority: NotificationPriority;
  requiresUserAction: boolean;
}

/**
 * Create a notification
 */
export async function createNotification(
  notification: Omit<Notification, 'id' | 'created_at' | 'read' | 'archived'>
): Promise<Notification> {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    read: false,
    archived: false,
    created_at: new Date().toISOString(),
  };

  // In production, would save to database
  console.log('Notification created:', newNotification);

  return newNotification;
}

/**
 * Create an action log entry
 */
export async function logAction(action: Omit<ActionLog, 'id' | 'created_at'>): Promise<ActionLog> {
  const log: ActionLog = {
    ...action,
    id: `action-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  console.log('Action logged:', log);
  return log;
}

/**
 * Create an audit event
 */
export async function createAuditEvent(
  event: Omit<AuditEvent, 'id' | 'timestamp'>
): Promise<AuditEvent> {
  const auditEvent: AuditEvent = {
    ...event,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  console.log('Audit event created:', auditEvent);
  return auditEvent;
}

/**
 * Notification templates
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  campaign_alert: {
    type: 'campaign_alert',
    title: 'Campaign Alert',
    messageTemplate: '{campaign} - {metric}: {value}',
    priority: 'high',
    requiresUserAction: false,
  },

  rule_executed: {
    type: 'rule_executed',
    title: 'Automation Rule Executed',
    messageTemplate: 'Rule "{ruleName}" executed action: {action}',
    emailTemplate: 'Your automation rule "{ruleName}" has been executed with action: {action}',
    priority: 'medium',
    requiresUserAction: false,
  },

  suggestion_created: {
    type: 'suggestion_created',
    title: 'New AI Suggestion',
    messageTemplate: 'New suggestion for {campaign}: {suggestType}',
    emailTemplate: 'Review and approve the new suggestion for {campaign}',
    priority: 'medium',
    requiresUserAction: true,
  },

  performance_anomaly: {
    type: 'performance_anomaly',
    title: 'Performance Anomaly Detected',
    messageTemplate: '{campaign} - {metric} changed by {change}%',
    emailTemplate:
      'Unusual change detected in {campaign}: {metric} changed by {change}%. Please review.',
    priority: 'high',
    requiresUserAction: true,
  },

  budget_alert: {
    type: 'budget_alert',
    title: 'Budget Alert',
    messageTemplate: 'Daily budget for {campaign} reached {percentage}%',
    emailTemplate: 'Daily budget alert for {campaign}: {percentage}% spent',
    priority: 'medium',
    requiresUserAction: false,
  },

  sync_failed: {
    type: 'sync_failed',
    title: 'Sync Failed',
    messageTemplate: 'Meta Ads sync failed: {error}',
    emailTemplate: 'Your Meta Ads account sync has failed. Error: {error}',
    priority: 'critical',
    requiresUserAction: true,
  },

  token_expired: {
    type: 'token_expired',
    title: 'Token Expired',
    messageTemplate: 'Meta Ads token has expired',
    emailTemplate: 'Your Meta Ads authentication token has expired. Please reconnect.',
    priority: 'critical',
    requiresUserAction: true,
  },

  system_alert: {
    type: 'system_alert',
    title: 'System Alert',
    messageTemplate: '{message}',
    emailTemplate: 'System alert: {message}',
    priority: 'high',
    requiresUserAction: false,
  },
};

/**
 * Render notification message using template and variables
 */
export function renderNotificationMessage(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/{(\w+)}/g, (_, key) => {
    return String(variables[key] || '');
  });
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: 'bg-blue-50 border-blue-200',
    medium: 'bg-yellow-50 border-yellow-200',
    high: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200',
  };
  return colors[priority];
}

/**
 * Get priority badge color
 */
export function getPriorityBadgeColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[priority];
}

/**
 * Get notification icon by type
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    campaign_alert: '📢',
    rule_executed: '⚡',
    suggestion_created: '💡',
    performance_anomaly: '⚠️',
    budget_alert: '💰',
    sync_failed: '❌',
    token_expired: '🔑',
    system_alert: '🔔',
  };
  return icons[type];
}

/**
 * Format audit event for display
 */
export function formatAuditEvent(event: AuditEvent): string {
  const action = `${event.event_type} ${event.entity_type}`;
  const entity = event.entity_id ? ` (${event.entity_id})` : '';
  return `${action}${entity}`;
}
