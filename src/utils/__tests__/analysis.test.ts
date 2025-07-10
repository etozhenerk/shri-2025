/**
 * Тестирование утилит для анализа данных и валидации файлов.
 *
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. Валидация файлов: проверка расширений, MIME-типов, размеров
 * 2. Работа с File API: создание тестовых файлов, модификация свойств
 * 3. Трансформация данных: преобразование server response в UI format
 * 4. Binary Data: работа с TextEncoder/TextDecoder для тестирования потоков
 * 5. Error Handling: кастомные ошибки и их правильная обработка
 *
 * ПАТТЕРНЫ ТЕСТИРОВАНИЯ:
 * - Input Validation: comprehensive проверка различных типов входных данных
 * - Error Boundaries: тестирование всех возможных ошибочных сценариев
 * - Data Transformation: проверка правильности преобразования данных
 * - Edge Cases: граничные случаи, неожиданные форматы данных
 * - Business Logic: соответствие бизнес-требованиям (округление, фильтрация)
 */
import { Highlights } from '@app-types/common';
import { describe, it, expect } from 'vitest';

import {
    InvalidServerResponseError,
    convertHighlightsToArray,
    transformAnalysisData,
    isCsvFile,
    validateCsvFile,
    validateServerResponse,
} from '../analysis';
import { HIGHLIGHT_TITLES } from '../consts';

describe('Утилиты для анализа данных', () => {
    /**
     * ТЕСТИРОВАНИЕ ВАЛИДАЦИИ CSV ФАЙЛОВ
     *
     * Comprehensive подход к валидации файлов:
     * 1. Проверка расширения файла
     * 2. Валидация MIME-типа
     * 3. Проверка размера файла
     * 4. Обработка edge cases (пустые файлы, отсутствие MIME-типа)
     *
     * ВАЖНО: В веб-приложениях валидация файлов критична для безопасности!
     */
    describe('validateCsvFile', () => {
        it('должна возвращать success для валидного CSV файла', () => {
            // ARRANGE: Создаем корректный CSV файл
            // File constructor: (parts, filename, options)
            const csvFile = new File(['test,data'], 'test.csv', { type: 'text/csv' });

            // ACT: Выполняем валидацию
            const result = validateCsvFile(csvFile);

            // ASSERT: Валидный файл должен пройти проверку
            expect(result.isValid).toBe(true);
        });

        it('должна возвращать ошибку для пустого файла', () => {
            // ARRANGE: Создаем пустой файл и принудительно устанавливаем размер 0
            const emptyFile = new File([''], 'test.csv', { type: 'text/csv' });
            // Переопределяем размер файла (в реальности это readonly свойство)
            Object.defineProperty(emptyFile, 'size', { value: 0 });

            // ACT
            const result = validateCsvFile(emptyFile);

            // ASSERT: Пустые файлы должны отклоняться с соответствующим сообщением
            expect(result.isValid).toBe(false);
            if (!result.isValid) {
                // Type guard для TypeScript
                expect(result.errorType).toBe('empty');
                expect(result.message).toBe('Файл пустой или поврежден');
            }
        });

        it('должна возвращать ошибку для файла с неправильным расширением', () => {
            // ARRANGE: Создаем файл с неправильным расширением
            const txtFile = new File(['test,data'], 'test.txt', { type: 'text/plain' });

            // ACT
            const result = validateCsvFile(txtFile);

            // ASSERT: Файлы с неправильным расширением должны отклоняться
            expect(result.isValid).toBe(false);
            if (!result.isValid) {
                expect(result.errorType).toBe('extension');
                expect(result.message).toBe('Можно загружать только *.csv файлы');
            }
        });

        it('должна возвращать ошибку для файла с неподдерживаемым MIME-типом', () => {
            // ARRANGE: Файл с правильным расширением, но неправильным MIME-типом
            // Такое может произойти при попытке обхода валидации
            const fileWithBadMime = new File(['test,data'], 'test.csv', { type: 'application/pdf' });

            // ACT
            const result = validateCsvFile(fileWithBadMime);

            // ASSERT: MIME-тип должен соответствовать ожиданиям
            expect(result.isValid).toBe(false);
            if (!result.isValid) {
                expect(result.errorType).toBe('mimeType');
                expect(result.message).toBe('Неподдерживаемый тип файла. Загрузите корректный CSV файл');
            }
        });

        it('должна принимать файлы с поддерживаемыми MIME-типами', () => {
            // ARRANGE: Список всех поддерживаемых MIME-типов для CSV
            // Разные браузеры и ОС могут устанавливать разные MIME-типы для CSV
            const supportedTypes = ['text/csv', 'application/csv', 'text/plain'];

            // ACT & ASSERT: Все поддерживаемые типы должны проходить валидацию
            supportedTypes.forEach((type) => {
                const csvFile = new File(['test,data'], 'test.csv', { type });
                const result = validateCsvFile(csvFile);
                expect(result.isValid).toBe(true);
            });
        });

        it('должна принимать файлы без MIME-типа', () => {
            // ARRANGE: Файл без явного указания MIME-типа
            // Может произойти при перетаскивании файлов в некоторых браузерах
            const csvFile = new File(['test,data'], 'test.csv');

            // ACT & ASSERT: Отсутствие MIME-типа не должно блокировать валидные файлы
            expect(validateCsvFile(csvFile).isValid).toBe(true);
        });
    });

    /**
     * ТЕСТИРОВАНИЕ УТИЛИТАРНОЙ ФУНКЦИИ ПРОВЕРКИ РАСШИРЕНИЯ
     *
     * Простая, но важная функция для определения типа файла по расширению.
     * Тестирование edge cases (разные регистры).
     */
    describe('isCsvFile', () => {
        it('должна возвращать true для файлов с расширением .csv', () => {
            // ARRANGE: Файл с обычным расширением .csv
            const csvFile = new File(['test'], 'test.csv', { type: 'text/csv' });

            // ACT & ASSERT
            expect(isCsvFile(csvFile)).toBe(true);
        });

        it('должна возвращать true для файлов с расширением .CSV в верхнем регистре', () => {
            // ARRANGE: Проверяем case-insensitive поведение
            // В Windows файлы могут иметь расширения в разных регистрах
            const csvFile = new File(['test'], 'test.CSV', { type: 'text/csv' });

            // ACT & ASSERT: Функция должна быть case-insensitive
            expect(isCsvFile(csvFile)).toBe(true);
        });

        it('должна возвращать false для файлов с другим расширением', () => {
            // ARRANGE: Файл с неправильным расширением
            const txtFile = new File(['test'], 'test.txt', { type: 'text/plain' });

            // ACT & ASSERT: Неправильные расширения должны отклоняться
            expect(isCsvFile(txtFile)).toBe(false);
        });
    });

    /**
     * ТЕСТИРОВАНИЕ ВАЛИДАЦИИ ОТВЕТОВ СЕРВЕРА
     *
     * Проверяет, содержит ли ответ сервера ожидаемые поля данных.
     * Важность валидации внешних данных.
     */
    describe('validateServerResponse', () => {
        it('должна возвращать true, если в ответе есть хотя бы один валидный ключ', () => {
            // ARRANGE: Создаем ответ с валидным и невалидным ключами
            const validResponse = {
                [Object.keys(HIGHLIGHT_TITLES)[0]]: 123, // Берем первый валидный ключ
                other_key: 'abc', // Невалидный ключ не должен мешать
            };

            // ACT & ASSERT: Наличие хотя бы одного валидного ключа = success
            expect(validateServerResponse(validResponse)).toBe(true);
        });

        it('должна возвращать false, если в ответе нет валидных ключей', () => {
            // ARRANGE: Ответ только с невалидными ключами
            const invalidResponse = {
                another_key: 'abc',
                yet_another_key: 456,
            };

            // ACT & ASSERT: Без валидных ключей ответ считается невалидным
            expect(validateServerResponse(invalidResponse)).toBe(false);
        });

        it('должна возвращать false для пустого объекта', () => {
            // ACT & ASSERT: Пустой объект = невалидный ответ
            expect(validateServerResponse({})).toBe(false);
        });
    });

    /**
     * ТЕСТИРОВАНИЕ ТРАНСФОРМАЦИИ ДАННЫХ
     *
     * Этот блок показывает как тестировать бизнес-логику трансформации:
     * 1. Преобразование серверных данных в формат UI
     * 2. Фильтрация ненужных полей
     * 3. Форматирование значений (округление)
     * 4. Обработка неизвестных ключей
     */
    describe('convertHighlightsToArray', () => {
        it('должна корректно конвертировать объект хайлайтов в массив', () => {
            // ARRANGE: Полный набор данных от сервера
            const highlights: Highlights = {
                total_spend_galactic: 15000,
                average_spend_galactic: 123.45,
                less_spent_civ: 'blobs',
                big_spent_civ: 'humans',
                rows_affected: 100,
                less_spent_at: 1,
                big_spent_at: 365,
                less_spent_value: 10,
                big_spent_value: 1000,
            };

            // Ожидаемый результат после трансформации
            const expected = [
                { title: '15000', description: HIGHLIGHT_TITLES.total_spend_galactic },
                { title: '123', description: HIGHLIGHT_TITLES.average_spend_galactic }, // Округлено!
                { title: 'humans', description: HIGHLIGHT_TITLES.big_spent_civ },
            ];

            // ACT
            const result = convertHighlightsToArray(highlights);

            // ASSERT: Проверяем структуру и содержимое результата
            expect(result).toEqual(expect.arrayContaining(expected));
            expect(result).toHaveLength(Object.keys(highlights).length);
        });

        it('должна округлять числовые значения', () => {
            // ARRANGE: Данные с десятичной частью
            const highlights: Highlights = { average_spend_galactic: 99.9 } as Highlights;

            // ACT
            const result = convertHighlightsToArray(highlights);

            // ASSERT: Проверяем бизнес-правило округления
            expect(result.find((h) => h.description === HIGHLIGHT_TITLES.average_spend_galactic)?.title).toBe('100');
        });

        it('должна использовать "Неизвестный параметр" для ключей не из HIGHLIGHT_TITLES', () => {
            // ARRANGE: Данные с неизвестным ключом (может прийти от нового API)
            const highlights = { ...{ unknown_key: 'some value' } } as unknown as Highlights;

            // ACT
            const result = convertHighlightsToArray(highlights);

            // ASSERT: Неизвестные ключи должны обрабатываться gracefully
            expect(result.find((h) => h.description === 'Неизвестный параметр')).toBeDefined();
        });
    });

    describe('transformAnalysisData', () => {
        // Создаем encoder для преобразования строк в binary data
        const encoder = new TextEncoder();

        it('должна успешно трансформировать валидный ответ сервера', () => {
            // ARRANGE: Создаем валидный ответ сервера
            const serverResponse = {
                average_spend_galactic: 150.6,
                rows_affected: 10, // Это поле должно быть отфильтровано
            };
            // Преобразуем в binary data (как приходит из network stream)
            const data = encoder.encode(JSON.stringify(serverResponse));

            // ACT: Трансформируем binary data в структуру для UI
            const { highlights, highlightsToStore } = transformAnalysisData(data);

            // ASSERT: Проверяем фильтрацию и трансформацию
            // rawData содержит rows_affected, но highlights не должен
            expect(highlights).toEqual({ average_spend_galactic: 150.6 });
            const expected = [{ title: '151', description: HIGHLIGHT_TITLES.average_spend_galactic }];
            expect(highlightsToStore).toEqual(expect.arrayContaining(expected));
        });

        it('должна выбрасывать ошибку InvalidServerResponseError при невалидном ответе', () => {
            // ARRANGE: Создаем ответ с невалидной структурой
            const invalidResponse = { invalid_key: 'value' };
            const data = encoder.encode(JSON.stringify(invalidResponse));

            // ACT & ASSERT: Невалидные данные должны вызывать кастомную ошибку
            expect(() => transformAnalysisData(data)).toThrow(InvalidServerResponseError);
            expect(() => transformAnalysisData(data)).toThrow('Файл не был корректно обработан на сервере :(');
        });

        it('должна корректно обрабатывать несколько JSON объектов в потоке, используя только первый', () => {
            // ARRANGE: Симулируем streaming ответ с несколькими JSON объектами
            // Такое может произойти при chunked transfer encoding
            const stream =
                JSON.stringify({ average_spend_galactic: 100 }) +
                '\n' +
                JSON.stringify({ average_spend_galactic: 200 }); // Второй объект должен игнорироваться

            const data = encoder.encode(stream);

            // ACT
            const { highlightsToStore } = transformAnalysisData(data);

            // ASSERT: Должен использоваться только первый JSON объект
            expect(
                highlightsToStore.find((h) => h.description === HIGHLIGHT_TITLES.average_spend_galactic)?.title
            ).toBe('100'); // Не '200'!
        });
    });
});
