/**
 * @vitest-environment jsdom
 * 
 * Тестирование асинхронного API-модуля с использованием streaming и колбэков.
 * 
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. Мокирование HTTP-клиента для изоляции тестируемого кода
 * 2. Тестирование колбэков (onData, onComplete, onError)
 * 3. Работа с ReadableStream для симуляции потоковой передачи данных
 * 4. Edge cases: сетевые сбои, поврежденные данные, прерывания
 * 5. Проверка порядка вызовов и правильности фильтрации данных
 */
import { afterEach, describe, expect, test, vi } from 'vitest';

import { analyzeCsv } from '../analysis';
import client from '../client';

// МОКИРОВАНИЕ: Заменяем реальный HTTP-клиент на mock-версию
// Это позволяет контролировать ответы API и тестировать различные сценарии
vi.mock('../client');

describe('API-модуль: Analysis (с колбэками)', () => {
    // ОЧИСТКА: Восстанавливаем оригинальное поведение после каждого теста
    // Это обеспечивает изоляцию тестов друг от друга
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('Должен вызывать onData и onComplete, отфильтровывая "rows_affected"', async () => {
        // ARRANGE: Подготавливаем тестовые данные
        // Важно: включаем поле "rows_affected", которое должно быть отфильтровано
        const mockRawData = {
            total_spend_galactic: 100,
            rows_affected: 10, // Это поле должно быть исключено из результата
        };
        
        // Создаем mock HTTP-ответа с JSON-данными
        const mockResponse = new Response(JSON.stringify(mockRawData), {
            status: 200,
        });
        
        // Настраиваем mock так, чтобы client.post возвращал наш тестовый ответ
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        // Создаем spy-функции для отслеживания вызовов колбэков
        // Spy позволяет проверить: вызывались ли функции, с какими аргументами, сколько раз
        const onData = vi.fn();
        const onComplete = vi.fn();
        const onError = vi.fn();
        const file = new File([''], 'test.csv');

        // ACT: Выполняем тестируемую функцию
        await analyzeCsv({ csv: file, onData, onComplete, onError });

        // ASSERT: Проверяем результаты
        // Проверяем, что onData был вызван с правильно отформатированными данными
        expect(onData).toHaveBeenCalledTimes(1);
        expect(onData).toHaveBeenCalledWith([
            { description: 'Общие расходы', title: '100' }, // Заметьте: rows_affected отфильтрован
        ]);

        // Проверяем, что onComplete получил исходные данные (но без rows_affected)
        expect(onComplete).toHaveBeenCalledTimes(1);
        expect(onComplete).toHaveBeenCalledWith({
            total_spend_galactic: 100,
            // rows_affected здесь нет - это важная бизнес-логика!
        });

        // Проверяем, что ошибок не было
        expect(onError).not.toHaveBeenCalled();
    });

    test('Должен вызывать onError при сетевой ошибке', async () => {
        // ARRANGE: Симулируем серверную ошибку (HTTP 500)
        const errorJson = { message: 'Ошибка сервера' };
        const mockResponse = new Response(JSON.stringify(errorJson), {
            status: 500, // Статус ошибки
        });
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        const onData = vi.fn();
        const onComplete = vi.fn();
        const onError = vi.fn();
        const file = new File([''], 'test.csv');

        // ACT: Выполняем функцию, ожидая ошибку
        await analyzeCsv({ csv: file, onData, onComplete, onError });

        // ASSERT: Проверяем обработку ошибок
        // Важно: проверяем не только факт вызова, но и правильность сообщения
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toBe('Ошибка сервера');

        // При ошибке успешные колбэки не должны вызываться
        expect(onData).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();
    });

    test('Должен вызывать onError при ошибке парсинга потока', async () => {
        // ARRANGE: Симулируем ответ с невалидным JSON
        const mockResponse = new Response('это не JSON', { status: 200 });
        vi.mocked(client.post).mockResolvedValue(mockResponse);

        const onData = vi.fn();
        const onComplete = vi.fn();
        const onError = vi.fn();
        const file = new File([''], 'test.csv');

        // ACT
        await analyzeCsv({ csv: file, onData, onComplete, onError });

        // ASSERT: Проверяем обработку ошибок парсинга
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
        expect(onError.mock.calls[0][0].message).toBe(
            'Неизвестная ошибка парсинга :('
        );

        expect(onData).not.toHaveBeenCalled();
    });

    describe('Stream Interruption и Network Resilience', () => {
        test('Должен обрабатывать отсутствие body в response', async () => {
            // ARRANGE: Симулируем Response без body (что может случиться в реальности)
            const mockResponse = new Response(null, { status: 200 });
            Object.defineProperty(mockResponse, 'body', { value: null });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: Должна быть обработана ошибка отсутствия данных
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.any(Error));
            expect(onError.mock.calls[0][0].message).toBe('Неизвестная ошибка при попытке обработать файл :(');
        });

        test('Должен обрабатывать поврежденные stream данные', async () => {
            // ARRANGE: Создаем ReadableStream с поврежденным JSON
            // ReadableStream позволяет симулировать потоковую передачу данных
            const corruptedStream = new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    // Отправляем невалидный JSON
                    controller.enqueue(encoder.encode('{ "corrupted": json }'));
                    controller.close();
                }
            });
            
            const mockResponse = new Response(null, { status: 200 });
            Object.defineProperty(mockResponse, 'body', { value: corruptedStream });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: Поврежденные данные должны вызвать ошибку парсинга
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.any(Error));
            expect(onError.mock.calls[0][0].message).toBe('Неизвестная ошибка парсинга :(');
        });

        test('Должен обрабатывать множественные чанки данных в stream', async () => {
            // ARRANGE: Создаем stream с несколькими чанками данных
            // Это имитирует реальную ситуацию, когда сервер отправляет данные частями
            const chunk1 = { total_spend_galactic: 100, rows_affected: 5 };
            const chunk2 = { average_spend_galactic: 50.5, rows_affected: 10 };
            
            const multiChunkStream = new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    // Отправляем два JSON-объекта в разных чанках
                    controller.enqueue(encoder.encode(JSON.stringify(chunk1) + '\n'));
                    controller.enqueue(encoder.encode(JSON.stringify(chunk2) + '\n'));
                    controller.close();
                }
            });

            const mockResponse = new Response(null, { status: 200 });
            Object.defineProperty(mockResponse, 'body', { value: multiChunkStream });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: Проверяем обработку множественных чанков
            // onData должен вызываться для каждого чанка отдельно
            expect(onData).toHaveBeenCalledTimes(2);
            
            // Проверяем содержимое каждого вызова
            expect(onData).toHaveBeenNthCalledWith(1, [
                { description: 'Общие расходы', title: '100' }
            ]);
            
            expect(onData).toHaveBeenNthCalledWith(2, [
                { description: 'Средние расходы', title: '51' } // Округление до целого
            ]);

            // onComplete должен вызываться один раз с последними валидными данными
            expect(onComplete).toHaveBeenCalledTimes(1);
            expect(onComplete).toHaveBeenCalledWith({
                average_spend_galactic: 50.5, // Без rows_affected
            });

            expect(onError).not.toHaveBeenCalled();
        });

        test('Должен обрабатывать прерывание stream в процессе чтения', async () => {
            // ARRANGE: Создаем stream, который прервется во время чтения
            // Это имитирует ситуацию потери сетевого соединения
            let streamController: ReadableStreamDefaultController;
            const interruptedStream = new ReadableStream({
                start(controller) {
                    streamController = controller;
                    const encoder = new TextEncoder();
                    // Отправляем первый чанк данных
                    controller.enqueue(encoder.encode(JSON.stringify({ total_spend_galactic: 100 })));
                    // Не закрываем stream сразу - он будет прерван через setTimeout
                }
            });

            const mockResponse = new Response(null, { status: 200 });
            Object.defineProperty(mockResponse, 'body', { value: interruptedStream });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT: Запускаем анализ и одновременно симулируем прерывание
            const analysisPromise = analyzeCsv({ csv: file, onData, onComplete, onError });
            
            // Через 10ms прерываем stream ошибкой сети
            setTimeout(() => {
                streamController!.error(new Error('Network interrupted'));
            }, 10);

            await analysisPromise;

            // ASSERT: Частичные данные должны быть обработаны
            expect(onData).toHaveBeenCalledTimes(1);
            expect(onData).toHaveBeenCalledWith([
                { description: 'Общие расходы', title: '100' }
            ]);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.any(Error));
            expect(onError.mock.calls[0][0].message).toBe('Network interrupted');
        });

        test('Должен обрабатывать пустой stream', async () => {
            // ARRANGE: Создаем stream, который сразу закрывается без данных
            // Это может произойти, если сервер ответил успешно, но нет данных для обработки
            const emptyStream = new ReadableStream({
                start(controller) {
                    controller.close(); // Сразу закрываем без отправки данных
                }
            });

            const mockResponse = new Response(null, { status: 200 });
            Object.defineProperty(mockResponse, 'body', { value: emptyStream });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: При пустом stream onData не должен вызываться
            expect(onData).not.toHaveBeenCalled();
            // onComplete должен вызваться с undefined (нет данных)
            expect(onComplete).toHaveBeenCalledTimes(1);
            expect(onComplete).toHaveBeenCalledWith(undefined);
            expect(onError).not.toHaveBeenCalled();
        });

        test('Должен обрабатывать InvalidServerResponseError в stream', async () => {
            // ARRANGE: Создаем stream с данными неизвестного формата
            // Симулирует ситуацию, когда сервер отправил JSON, но без ожидаемых полей
            const invalidDataStream = new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    // Отправляем JSON с неожиданной структурой данных
                    controller.enqueue(encoder.encode(JSON.stringify({ invalid_key: 'value' })));
                    controller.close();
                }
            });

            const mockResponse = new Response(null, { status: 200 });
            Object.defineProperty(mockResponse, 'body', { value: invalidDataStream });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: Неизвестный формат данных должен вызвать специфическую ошибку
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.any(Error));
            expect(onError.mock.calls[0][0].message).toBe('Файл не был корректно обработан на сервере :(');
            
            // При ошибке формата данных успешные колбэки не вызываются
            expect(onData).not.toHaveBeenCalled();
            expect(onComplete).not.toHaveBeenCalled();
        });

        test('Должен обрабатывать JSON с пустыми строками в stream', async () => {
            // ARRANGE: Создаем stream с валидным JSON, но с лишними переносами строк
            // Реальные API часто добавляют форматирование, которое нужно игнорировать
            const streamWithEmptyLines = new ReadableStream({
                start(controller) {
                    const encoder = new TextEncoder();
                    // Добавляем несколько переносов строк после JSON
                    const data = JSON.stringify({ total_spend_galactic: 200 }) + '\n\n\n';
                    controller.enqueue(encoder.encode(data));
                    controller.close();
                }
            });

            const mockResponse = new Response(null, { status: 200 });
            Object.defineProperty(mockResponse, 'body', { value: streamWithEmptyLines });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: Пустые строки должны игнорироваться, валидный JSON обрабатываться
            expect(onData).toHaveBeenCalledTimes(1);
            expect(onData).toHaveBeenCalledWith([
                { description: 'Общие расходы', title: '200' }
            ]);
            expect(onComplete).toHaveBeenCalledTimes(1);
            expect(onError).not.toHaveBeenCalled();
        });
    });

    describe('Error Response Handling', () => {
        test('Должен обрабатывать error ответ без поля "error"', async () => {
            // ARRANGE: Создаем ошибку HTTP 400 с JSON, но без стандартного поля "error"
            // Разные API могут использовать разные форматы для сообщений об ошибках
            const errorJson = { message: 'Другое сообщение об ошибке' };
            const mockResponse = new Response(JSON.stringify(errorJson), {
                status: 400, // Bad Request
            });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: Должно корректно извлекать сообщение из поля "message"
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.any(Error));
            expect(onError.mock.calls[0][0].message).toBe('Другое сообщение об ошибке');
        });

        test('Должен обрабатывать error ответ без JSON', async () => {
            // ARRANGE: Создаем серверную ошибку с простым текстом (не JSON)
            // Бывает когда сервер полностью недоступен или возвращает HTML-страницу ошибки
            const mockResponse = new Response('Internal Server Error', {
                status: 500, // Internal Server Error
            });
            vi.mocked(client.post).mockResolvedValue(mockResponse);

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            // ACT
            await analyzeCsv({ csv: file, onData, onComplete, onError });

            // ASSERT: Должен обрабатывать не-JSON ошибки с fallback сообщением
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.any(Error));
            expect(onError.mock.calls[0][0].message).toContain('Unexpected token');
        });

        test('Должен обрабатывать network timeout/abort', async () => {
            vi.mocked(client.post).mockRejectedValue(new Error('Request timed out'));

            const onData = vi.fn();
            const onComplete = vi.fn();
            const onError = vi.fn();
            const file = new File([''], 'test.csv');

            await analyzeCsv({ csv: file, onData, onComplete, onError });

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.any(Error));
            expect(onError.mock.calls[0][0].message).toBe('Request timed out');
            
            expect(onData).not.toHaveBeenCalled();
            expect(onComplete).not.toHaveBeenCalled();
        });
    });
}); 