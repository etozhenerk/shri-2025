/**
 * @vitest-environment jsdom
 * 
 * Тестирование API для генерации отчетов с файлами.
 * 
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. Работа с Blob API для тестирования файловых данных
 * 2. Извлечение имени файла из заголовка Content-Disposition
 * 3. Тестирование различных HTTP-статусов и форматов ошибок
 * 4. Проверка MIME-типов и размеров файлов
 * 5. Fallback стратегии при отсутствии заголовков
 * 
 * ОТЛИЧИЯ ОТ analysis.test.ts:
 * - Здесь мы работаем с бинарными данными (blob), а не streaming JSON
 * - Тестируем извлечение метаданных из HTTP-заголовков
 * - Используем простые Promise, а не колбэки
 */
import { afterEach, describe, expect, test, vi } from 'vitest';

import client from '../client';
import { generateReport } from '../report';

// МОКИРОВАНИЕ: Изолируем тестируемый код от реального HTTP-клиента
vi.mock('../client');

describe('API-модуль: Report', () => {
    // ОЧИСТКА: Гарантируем изоляцию тестов
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Должен возвращать blob и имя файла при успешном запросе', async () => {
        // ARRANGE: Подготавливаем mock успешного ответа с CSV-файлом
        const mockCsvData = 'col1,col2\\nval1,val2';
        const mockFilename = 'report-test.csv';
        
        // Создаем Response с правильными заголовками для файла
        const mockResponse = new Response(mockCsvData, {
            status: 200,
            headers: {
                // Content-Disposition указывает имя файла для скачивания
                'Content-Disposition': `attachment; filename="${mockFilename}"`,
                'Content-Type': 'text/csv', // MIME-тип для CSV файлов
            },
        });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // ACT: Выполняем функцию генерации отчета
        const { blob, filename } = await generateReport();

        // ASSERT: Проверяем все аспекты результата
        
        // 1. Правильный вызов API с нужными параметрами
        expect(client.get).toHaveBeenCalledWith('/report?size=0.01');
        
        // 2. Проверяем содержимое blob'а
        expect(await blob.text()).toBe(mockCsvData);
        expect(blob.size).toBe(mockCsvData.length);
        expect(blob.type).toBe('text/csv');
        
        // 3. Проверяем правильное извлечение имени файла
        expect(filename).toBe(mockFilename);
    });

    test('Должен выбрасывать ошибку с сообщением от сервера, если ответ не "ok"', async () => {
        // ARRANGE: Симулируем серверную ошибку с JSON-ответом
        const errorJson = { error: 'Ошибка на сервере' };
        const mockResponse = new Response(JSON.stringify(errorJson), {
            status: 500, // Internal Server Error
            headers: { 'Content-Type': 'application/json' },
        });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // ACT & ASSERT: Проверяем, что ошибка выбрасывается с правильным сообщением
        // Используем expect().rejects для тестирования асинхронных ошибок
        await expect(generateReport()).rejects.toThrow('Произошла ошибка: Ошибка на сервере');
    });

    test('Должен выбрасывать ошибку по умолчанию, если в JSON-ответе нет поля "error"', async () => {
        // ARRANGE: Симулируем ошибку с нестандартным форматом JSON
        // API может возвращать ошибки в разных форматах
        const errorJson = { message: 'Другое сообщение' }; // нет поля "error"
        const mockResponse = new Response(JSON.stringify(errorJson), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // ACT & ASSERT: Проверяем fallback сообщение об ошибке
        await expect(generateReport()).rejects.toThrow('Неизвестная ошибка при попытке сгенерировать отчёт');
    });

    test('Должен выбрасывать ошибку парсинга, если тело ответа не является JSON', async () => {
        // ARRANGE: Симулируем серверную ошибку с не-JSON ответом
        // Может произойти при полном падении сервера или проблемах с прокси
        const mockResponse = new Response('просто строка', { status: 500 });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // ACT & ASSERT: Проверяем обработку ошибок парсинга JSON
        // Здесь мы НЕ оборачиваем ошибку, поэтому получаем оригинальную ошибку JSON.parse
        await expect(generateReport()).rejects.toThrow('Unexpected token');
    });

    test('Должен использовать имя файла по умолчанию, если заголовок Content-Disposition отсутствует', async () => {
        // ARRANGE: Создаем успешный ответ БЕЗ заголовка Content-Disposition
        // Такое может случиться при некорректной настройке сервера
        const mockResponse = new Response('csv', { 
            status: 200 
            // Намеренно НЕ добавляем Content-Disposition
        });
        vi.mocked(client.get).mockResolvedValue(mockResponse);

        // ACT
        const { filename } = await generateReport();

        // ASSERT: Проверяем fallback к имени файла по умолчанию
        // Это важно для UX - пользователь всегда должен получить файл с осмысленным именем
        expect(filename).toBe('report.csv');
    });
}); 