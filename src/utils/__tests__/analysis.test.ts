import { describe, it, expect } from 'vitest';

import { Highlights } from '../types/common';

import {
    transformAnalysisData,
    convertHighlightsToArray,
    isCsvFile,
    validateServerResponse,
    InvalidServerResponseError,
} from './analysis';
import { HIGHLIGHT_TITLES } from './consts';

describe('Утилиты для анализа данных', () => {
    describe('isCsvFile', () => {
        it('должна возвращать true для файлов с расширением .csv', () => {
            const csvFile = new File([''], 'test.csv', { type: 'text/csv' });
            expect(isCsvFile(csvFile)).toBe(true);
        });

        it('должна возвращать true для файлов с расширением .CSV в верхнем регистре', () => {
            const csvFile = new File([''], 'test.CSV', { type: 'text/csv' });
            expect(isCsvFile(csvFile)).toBe(true);
        });

        it('должна возвращать false для файлов с другим расширением', () => {
            const txtFile = new File([''], 'test.txt', { type: 'text/plain' });
            expect(isCsvFile(txtFile)).toBe(false);
        });
    });

    describe('validateServerResponse', () => {
        it('должна возвращать true, если в ответе есть хотя бы один валидный ключ', () => {
            const validResponse = { [Object.keys(HIGHLIGHT_TITLES)[0]]: 123, other_key: 'abc' };
            expect(validateServerResponse(validResponse)).toBe(true);
        });

        it('должна возвращать false, если в ответе нет валидных ключей', () => {
            const invalidResponse = { another_key: 'abc', yet_another_key: 456 };
            expect(validateServerResponse(invalidResponse)).toBe(false);
        });

        it('должна возвращать false для пустого объекта', () => {
            expect(validateServerResponse({})).toBe(false);
        });
    });

    describe('convertHighlightsToArray', () => {
        it('должна корректно конвертировать объект хайлайтов в массив', () => {
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
            const expected = [
                { title: '15000', description: HIGHLIGHT_TITLES.total_spend_galactic },
                { title: '123', description: HIGHLIGHT_TITLES.average_spend_galactic },
                { title: 'Empire', description: HIGHLIGHT_TITLES.big_spent_civ },
            ];
            const result = convertHighlightsToArray(highlights);
            expect(result).toEqual(expect.arrayContaining(expected));
            expect(result).toHaveLength(Object.keys(highlights).length);
        });

        it('должна округлять числовые значения', () => {
            const highlights: Highlights = { average_spend_galactic: 99.9 } as Highlights;
            const result = convertHighlightsToArray(highlights);
            expect(result.find((h) => h.description === HIGHLIGHT_TITLES.average_spend_galactic)?.title).toBe('100');
        });

        it('должна использовать "Неизвестный параметр" для ключей не из HIGHLIGHT_TITLES', () => {
            const highlights = { ...{ unknown_key: 'some value' } } as unknown as Highlights;
            const result = convertHighlightsToArray(highlights);
            expect(result.find((h) => h.description === 'Неизвестный параметр')).toBeDefined();
        });
    });

    describe('transformAnalysisData', () => {
        const encoder = new TextEncoder();

        it('должна успешно трансформировать валидный ответ сервера', () => {
            const serverResponse = {
                average_spend_galactic: 150.6,
                rows_affected: 10,
            };
            const data = encoder.encode(JSON.stringify(serverResponse));
            const { highlights, highlightsToStore } = transformAnalysisData(data);

            // rawData contains rows_affected, but highlights should not
            expect(highlights).toEqual({ average_spend_galactic: 150.6 });
            const expected = [{ title: '151', description: HIGHLIGHT_TITLES.average_spend_galactic }];
            expect(highlightsToStore).toEqual(expect.arrayContaining(expected));
        });

        it('должна выбрасывать ошибку InvalidServerResponseError при невалидном ответе', () => {
            const invalidResponse = { invalid_key: 'value' };
            const data = encoder.encode(JSON.stringify(invalidResponse));
            expect(() => transformAnalysisData(data)).toThrow(InvalidServerResponseError);
            expect(() => transformAnalysisData(data)).toThrow('Файл не был корректно обработан на сервере :(');
        });

        it('должна корректно обрабатывать несколько JSON объектов в потоке, используя только первый', () => {
            const stream =
                JSON.stringify({ average_spend_galactic: 100 }) +
                '\n' +
                JSON.stringify({ average_spend_galactic: 200 });
            const data = encoder.encode(stream);
            const { highlightsToStore } = transformAnalysisData(data);
            expect(
                highlightsToStore.find((h) => h.description === HIGHLIGHT_TITLES.average_spend_galactic)?.title
            ).toBe('100');
        });
    });
});
