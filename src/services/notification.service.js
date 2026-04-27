import { EventEmitter } from 'node:events';
import { IncomingWebhook } from '@slack/webhook';

const webhook = process.env.SLACK_WEBHOOK
  ? new IncomingWebhook(process.env.SLACK_WEBHOOK)
  : null;

class NotificationService extends EventEmitter {}

export const notificationService = new NotificationService();

notificationService.on('user:invited', (payload) => {
  console.log('Evento user:invited =>', payload);
});

export const sendSlackError = async ({
  timestamp,
  method,
  route,
  message,
  stack
}) => {
  if (!webhook) {
    console.warn('SLACK_WEBHOOK no configurado');
    return;
  }

  try {
    await webhook.send({
      text: `
      *Error 5XX en BildyApp*

      *Timestamp:* ${timestamp}
      *Método:* ${method}
      *Ruta:* ${route}
      *Mensaje:* ${message}
      `
    });
  } catch (err) {
    console.error('Error enviando a Slack:', err);
  }
};