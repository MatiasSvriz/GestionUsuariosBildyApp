import { jest } from '@jest/globals';
import { setSocketIO, getSocketIO, emitToCompany } from '../src/services/socket.service.js';

describe('socket.service', () => {
  test('guarda y devuelve la instancia de Socket.IO', () => {
    const ioMock = { to: jest.fn() };

    setSocketIO(ioMock);

    expect(getSocketIO()).toBe(ioMock);
  });

  test('emite un evento a una room de company', () => {
    const emitMock = jest.fn();

    const ioMock = {
      to: jest.fn(() => ({
        emit: emitMock
      }))
    };

    setSocketIO(ioMock);

    emitToCompany('company123', 'client:new', { name: 'Cliente Test' });

    expect(ioMock.to).toHaveBeenCalledWith('company123');
    expect(emitMock).toHaveBeenCalledWith('client:new', { name: 'Cliente Test' });
  });
});