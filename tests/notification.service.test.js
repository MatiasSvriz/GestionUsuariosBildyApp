import { jest } from '@jest/globals';

describe('notification.service', () => {

  beforeEach(() => {
    jest.resetModules();
  });

  test('emite evento user:invited', async () => {
    const { notificationService } = await import('../src/services/notification.service.js');

    const listener = jest.fn();

    notificationService.on('user:invited', listener);

    const payload = { email: 'test@test.com' };

    notificationService.emit('user:invited', payload);

    expect(listener).toHaveBeenCalledWith(payload);

    notificationService.off('user:invited', listener);
  });

  test('no envía a Slack si no hay webhook', async () => {
    delete process.env.SLACK_WEBHOOK;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { sendSlackError } = await import('../src/services/notification.service.js');

    await sendSlackError({
      timestamp: 'now',
      method: 'GET',
      route: '/test',
      message: 'error',
      stack: 'stack'
    });

    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test('envía error a Slack correctamente', async () => {
    process.env.SLACK_WEBHOOK = 'https://fake.url';

    const sendMock = jest.fn().mockResolvedValue();

    jest.unstable_mockModule('@slack/webhook', () => ({
      IncomingWebhook: jest.fn(() => ({
        send: sendMock
      }))
    }));

    const { sendSlackError } = await import('../src/services/notification.service.js');

    await sendSlackError({
      timestamp: 'now',
      method: 'POST',
      route: '/error',
      message: 'fallo',
      stack: 'stack'
    });

    expect(sendMock).toHaveBeenCalled();
  });

  test('maneja error al enviar a Slack', async () => {
    process.env.SLACK_WEBHOOK = 'https://fake.url';

    const errorMock = jest.fn().mockRejectedValue(new Error('Slack fail'));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.unstable_mockModule('@slack/webhook', () => ({
      IncomingWebhook: jest.fn(() => ({
        send: errorMock
      }))
    }));

    const { sendSlackError } = await import('../src/services/notification.service.js');

    await sendSlackError({
      timestamp: 'now',
      method: 'POST',
      route: '/error',
      message: 'fallo',
      stack: 'stack'
    });

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

});