import { EventEmitter } from 'node:events';

class NotificationService extends EventEmitter {}

export const notificationService = new NotificationService();

notificationService.on('user:invited', (payload) => {
  console.log('Evento user:invited =>', payload);
});