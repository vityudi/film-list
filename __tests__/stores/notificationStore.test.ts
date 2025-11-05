import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  useNotificationStore,
  type Notification,
} from '../../lib/utils/notificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    // Reset store state and clear all timers
    useNotificationStore.setState({ notifications: [] });
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('initial state', () => {
    it('should have empty notifications initially', () => {
      const { notifications } = useNotificationStore.getState();
      expect(notifications).toEqual([]);
    });
  });

  describe('addNotification', () => {
    it('should add a success notification', () => {
      useNotificationStore.getState().addNotification('Test message', 'success');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Test message');
      expect(notifications[0].type).toBe('success');
    });

    it('should add an error notification', () => {
      useNotificationStore.getState().addNotification('Error occurred', 'error');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Error occurred');
      expect(notifications[0].type).toBe('error');
    });

    it('should add an info notification', () => {
      useNotificationStore.getState().addNotification('Info message', 'info');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Info message');
      expect(notifications[0].type).toBe('info');
    });

    it('should add multiple notifications', () => {
      useNotificationStore.getState().addNotification('First', 'success');
      useNotificationStore.getState().addNotification('Second', 'error');
      useNotificationStore.getState().addNotification('Third', 'info');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(3);
    });

    it('should generate unique IDs for notifications', () => {
      useNotificationStore.getState().addNotification('First', 'success');
      useNotificationStore.getState().addNotification('Second', 'success');

      const { notifications } = useNotificationStore.getState();
      const ids = notifications.map((n) => n.id);
      expect(new Set(ids).size).toBe(2); // All unique
    });

    it('should set default duration to 3000ms', () => {
      useNotificationStore.getState().addNotification('Test', 'success');

      const { notifications } = useNotificationStore.getState();
      expect(notifications[0].duration).toBe(3000);
    });

    it('should use custom duration when provided', () => {
      useNotificationStore.getState().addNotification('Test', 'success', 5000);

      const { notifications } = useNotificationStore.getState();
      expect(notifications[0].duration).toBe(5000);
    });

    it('should allow zero duration (no auto-remove)', () => {
      vi.useFakeTimers();

      useNotificationStore.getState().addNotification('Test', 'success', 0);

      const { notifications: notificationsAfterAdd } = useNotificationStore.getState();
      expect(notificationsAfterAdd).toHaveLength(1);

      vi.advanceTimersByTime(5000);

      const { notifications: notificationsAfterAdvance } = useNotificationStore.getState();
      expect(notificationsAfterAdvance).toHaveLength(1); // Should not auto-remove

      vi.useRealTimers();
    });

    it('should auto-remove notification after duration', () => {
      vi.useFakeTimers();

      useNotificationStore.getState().addNotification('Test', 'success', 3000);

      const { notifications: notificationsAfterAdd } = useNotificationStore.getState();
      expect(notificationsAfterAdd).toHaveLength(1);

      const id = notificationsAfterAdd[0].id;

      vi.advanceTimersByTime(3000);

      const { notifications: notificationsAfterTimer } = useNotificationStore.getState();
      expect(notificationsAfterTimer).toHaveLength(0);

      vi.useRealTimers();
    });

    it('should not auto-remove before duration expires', () => {
      vi.useFakeTimers();

      useNotificationStore.getState().addNotification('Test', 'success', 5000);

      vi.advanceTimersByTime(3000);

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);

      vi.useRealTimers();
    });
  });

  describe('removeNotification', () => {
    it('should remove notification by id', () => {
      useNotificationStore.getState().addNotification('Test', 'success', 0);

      const { notifications: notificationsAfterAdd } = useNotificationStore.getState();
      const id = notificationsAfterAdd[0].id;

      useNotificationStore.getState().removeNotification(id);

      const { notifications: notificationsAfterRemove } = useNotificationStore.getState();
      expect(notificationsAfterRemove).toHaveLength(0);
    });

    it('should only remove the specified notification', () => {
      useNotificationStore.getState().addNotification('First', 'success', 0);
      useNotificationStore.getState().addNotification('Second', 'error', 0);

      const { notifications: notificationsAfterAdd } = useNotificationStore.getState();
      const firstId = notificationsAfterAdd[0].id;

      useNotificationStore.getState().removeNotification(firstId);

      const { notifications: notificationsAfterRemove } = useNotificationStore.getState();
      expect(notificationsAfterRemove).toHaveLength(1);
      expect(notificationsAfterRemove[0].message).toBe('Second');
    });

    it('should handle removing non-existent notification gracefully', () => {
      useNotificationStore.getState().addNotification('Test', 'success', 0);

      useNotificationStore.getState().removeNotification('non-existent-id');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1); // Should remain unchanged
    });
  });

  describe('clearNotifications', () => {
    it('should clear all notifications', () => {
      useNotificationStore.getState().addNotification('First', 'success', 0);
      useNotificationStore.getState().addNotification('Second', 'error', 0);
      useNotificationStore.getState().addNotification('Third', 'info', 0);

      useNotificationStore.getState().clearNotifications();

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(0);
    });

    it('should handle clearing empty notifications', () => {
      useNotificationStore.getState().clearNotifications();

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(0);
    });
  });

  describe('complex workflows', () => {
    it('should handle add-remove-add workflow', () => {
      useNotificationStore.getState().addNotification('First', 'success', 0);
      const { notifications: after1 } = useNotificationStore.getState();
      const firstId = after1[0].id;

      useNotificationStore.getState().removeNotification(firstId);

      expect(useNotificationStore.getState().notifications).toHaveLength(0);

      useNotificationStore.getState().addNotification('Second', 'error', 0);

      const { notifications: after2 } = useNotificationStore.getState();
      expect(after2).toHaveLength(1);
      expect(after2[0].message).toBe('Second');
    });

    it('should handle multiple auto-remove timers independently', () => {
      vi.useFakeTimers();

      useNotificationStore.getState().addNotification('First', 'success', 2000);
      useNotificationStore.getState().addNotification('Second', 'error', 4000);

      let notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(2);

      vi.advanceTimersByTime(2000);
      notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Second');

      vi.advanceTimersByTime(2000);
      notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(0);

      vi.useRealTimers();
    });

    it('should maintain order of notifications', () => {
      useNotificationStore.getState().addNotification('First', 'success', 0);
      useNotificationStore.getState().addNotification('Second', 'error', 0);
      useNotificationStore.getState().addNotification('Third', 'info', 0);

      const { notifications } = useNotificationStore.getState();
      expect(notifications[0].message).toBe('First');
      expect(notifications[1].message).toBe('Second');
      expect(notifications[2].message).toBe('Third');
    });

    it('should handle rapid add and clear operations', () => {
      useNotificationStore.getState().addNotification('First', 'success', 0);
      useNotificationStore.getState().addNotification('Second', 'error', 0);
      useNotificationStore.getState().clearNotifications();
      useNotificationStore.getState().addNotification('Third', 'info', 0);

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Third');
    });
  });

  describe('notification structure', () => {
    it('should create notification with correct structure', () => {
      useNotificationStore.getState().addNotification('Test', 'success', 5000);

      const { notifications } = useNotificationStore.getState();
      const notification = notifications[0];

      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('message', 'Test');
      expect(notification).toHaveProperty('type', 'success');
      expect(notification).toHaveProperty('duration', 5000);

      // Verify ID is a valid string
      expect(typeof notification.id).toBe('string');
      expect(notification.id.length).toBeGreaterThan(0);
    });
  });
});
