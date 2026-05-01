import { jest } from '@jest/globals';
import { requireRole } from '../src/middleware/role.middleware.js';

describe('role.middleware', () => {
  test('rechaza si no hay usuario', () => {
    const req = {};
    const next = jest.fn();

    requireRole('admin')(req, {}, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  test('rechaza si el rol no está permitido', () => {
    const req = {
      user: { role: 'guest' }
    };
    const next = jest.fn();

    requireRole('admin')(req, {}, next);

    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  test('permite si el rol está permitido', () => {
    const req = {
      user: { role: 'admin' }
    };
    const next = jest.fn();

    requireRole('admin', 'guest')(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });
});