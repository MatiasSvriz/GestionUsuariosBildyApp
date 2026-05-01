import { jest } from '@jest/globals';

const sendMailMock = jest.fn();

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: sendMailMock
    }))
  }
}));

const { sendVerificationEmail } = await import('../src/services/email.service.js');

describe('email.service', () => {
  beforeEach(() => {
    sendMailMock.mockClear();

    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';
    process.env.SMTP_FROM = 'BildyApp <test@test.com>';
  });

  test('envía email de verificación', async () => {
    await sendVerificationEmail({
      to: 'destino@test.com',
      code: '123456'
    });

    expect(sendMailMock).toHaveBeenCalled();
    expect(sendMailMock.mock.calls[0][0].to).toBe('destino@test.com');
    expect(sendMailMock.mock.calls[0][0].subject).toContain('Código');
  });
});