/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';

import { analyzeCsv } from '../analysis';
import client from '../client';

vi.mock('../client');

describe('API-модуль: Analysis (с колбэками)', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Должен вызывать onData и onComplete, отфильтровывая "rows_affected"', async () => {
        // Arrange
        const mockRawData = {
            total_spend_galactic: 100,
            rows_affected: 10,
        };
        const mockResponse = new Response(JSON.stringify(mockRawData), {
            status: 200,
        });
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        const onData = vi.fn();
        const onComplete = vi.fn();
        const onError = vi.fn();
        const file = new File([''], 'test.csv');

        // Act
        await analyzeCsv({ csv: file, onData, onComplete, onError });

        // Assert
        // 1. Проверяем onData: должен быть вызван с отфильтрованными данными (без rows_affected)
        expect(onData).toHaveBeenCalledTimes(1);
        expect(onData).toHaveBeenCalledWith([
            { description: 'Общие расходы', title: '100' },
        ]);

        // 2. Проверяем onComplete: должен быть вызван с отфильтрованными данными
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({
            total_spend_galactic: 100,
        });

        expect(onError).not.toHaveBeenCalled();
    });

    test('Должен вызывать onError при сетевой ошибке', async () => {
        // Arrange
        const errorJson = { message: 'Ошибка сервера' };
        const mockResponse = new Response(JSON.stringify(errorJson), {
            status: 500,
        });
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        const onData = vi.fn();
        const onComplete = vi.fn();
        const onError = vi.fn();
        const file = new File([''], 'test.csv');

        // Act
        await analyzeCsv({ csv: file, onData, onComplete, onError });

        // Assert
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toBe('Ошибка сервера');

        expect(onData).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
    });

    test('Должен вызывать onError при ошибке парсинга потока', async () => {
        // Arrange
        const mockResponse = new Response('это не JSON', { status: 200 });
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        const onData = vi.fn();
        const onComplete = vi.fn();
        const onError = vi.fn();
        const file = new File([''], 'test.csv');

        // Act
        await analyzeCsv({ csv: file, onData, onComplete, onError });

        // Assert
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toBe(
            'Неизвестная ошибка парсинга :('
        );

        expect(onData).not.toHaveBeenCalled();
    });
}); 