/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';

import client from '../client';
import { generateReport } from '../report';

vi.mock('../client');

describe('API-модуль: Report', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Должен возвращать blob и имя файла при успешном запросе', async () => {
        // Arrange
        const mockCsvData = 'col1,col2\\nval1,val2';
        const mockFilename = 'report-test.csv';
        const mockResponse = new Response(mockCsvData, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${mockFilename}"`,
                'Content-Type': 'text/csv',
            },
        });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // Act
        const { blob, filename } = await generateReport();

        // Assert
        expect(client.get).toHaveBeenCalledWith('/report?size=0.01');
        expect(await blob.text()).toBe(mockCsvData);
        expect(blob.size).toBe(mockCsvData.length);
        expect(blob.type).toBe('text/csv');
        expect(filename).toBe(mockFilename);
    });

    test('Должен выбрасывать ошибку с сообщением от сервера, если ответ не "ok"', async () => {
        // Arrange
        const errorJson = { error: 'Ошибка на сервере' };
        const mockResponse = new Response(JSON.stringify(errorJson), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // Act & Assert
        await expect(generateReport()).rejects.toThrow('Произошла ошибка: Ошибка на сервере');
    });

    test('Должен выбрасывать ошибку по умолчанию, если в JSON-ответе нет поля "error"', async () => {
        // Arrange
        const errorJson = { message: 'Другое сообщение' };
        const mockResponse = new Response(JSON.stringify(errorJson), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // Act & Assert
        await expect(generateReport()).rejects.toThrow('Неизвестная ошибка при попытке сгенерировать отчёт');
    });

    test('Должен выбрасывать ошибку парсинга, если тело ответа не является JSON', async () => {
        // Arrange
        const mockResponse = new Response('просто строка', { status: 500 });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // Act & Assert
        await expect(generateReport()).rejects.toThrow('Unexpected token');
    });

    test('Должен использовать имя файла по умолчанию, если заголовок Content-Disposition отсутствует', async () => {
        // Arrange
        const mockResponse = new Response('csv', { status: 200 });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // Act
        const { filename } = await generateReport();

        // Assert
        expect(filename).toBe('report.csv');
    });
}); 