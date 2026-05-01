import { AppError } from '../src/utils/AppError.js';

describe('AppError', () => {

  test('crea error base correctamente', () => {
    const error = new AppError('Test', 418, 'I_AM_A_TEAPOT');

    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Test');
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('I_AM_A_TEAPOT');
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  test('usa valores por defecto en constructor', () => {
    const error = new AppError('Default');

    expect(error.statusCode).toBe(500);
    expect(error.code).toBeNull();
  });

  test('badRequest', () => {
    const error = AppError.badRequest('Error de prueba');

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });

  test('unauthorized', () => {
    const error = AppError.unauthorized();

    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  test('forbidden', () => {
    const error = AppError.forbidden();

    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  test('notFound con recurso', () => {
    const error = AppError.notFound('Cliente');

    expect(error.message).toBe('Cliente no encontrado');
    expect(error.statusCode).toBe(404);
  });

  test('notFound por defecto', () => {
    const error = AppError.notFound();

    expect(error.message).toBe('Recurso no encontrado');
  });

  test('conflict', () => {
    const error = AppError.conflict();

    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  test('validation incluye details', () => {
    const details = [{ field: 'email', message: 'inválido' }];

    const error = AppError.validation('Error de validación', details);

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(details);
  });

  test('validation sin details', () => {
    const error = AppError.validation();

    expect(error.details).toEqual([]);
  });

  test('tooManyRequests', () => {
    const error = AppError.tooManyRequests();

    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT');
  });

  test('internal', () => {
    const error = AppError.internal();

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
  });

});