import { AnalysisHighlight } from '@app-types/analysis';
import { Highlights } from '@app-types/common';
import { HIGHLIGHT_TITLES } from '@utils/consts';

/**
 * Кастомная ошибка для некорректных ответов сервера
 */
export class InvalidServerResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidServerResponseError';
    }
}
/**
 * Парсит потоковый ответ от сервера
 * @param value Блок потоковых данных
 * @returns Первый JSON объект из блока
 */
const getFirstJsonObject = (value: Uint8Array): Record<string, string | number> => {
    const decoder = new TextDecoder();
    const textChunk = decoder.decode(value).split('\n')[0];
    return JSON.parse(textChunk);
};

/**
 * Преобразует потоковые данные API в объект хайлайтов.
 * @param value Потоковые данные в формате Uint8Array.
 * @returns.highlights Сырые данные хайлайтов в формате Highlights.
 * @returns.highlightsToStore Массив отформатированных объектов Highlight с полями title и description.
 */
export const transformAnalysisData = (
    value: Uint8Array
): {
    highlights: Highlights;
    highlightsToStore: AnalysisHighlight[];
} => {
    const rawData = getFirstJsonObject(value);

    // Валидация ответа сервера
    if (!validateServerResponse(rawData)) {
        throw new InvalidServerResponseError('Файл не был корректно обработан на сервере :(');
    }

    const { rows_affected: _rows_affected, ...highlights } = rawData;

    const highlightsToStore = convertHighlightsToArray(highlights as Highlights);

    return { highlights: highlights as Highlights, highlightsToStore };
};

/**
 * Преобразует объект Highlights в массив объектов Highlight.
 * @param highlights Объект с данными хайлайтов типа Highlights.
 * @returns Массив объектов Highlight с полями title и description.
 */
export const convertHighlightsToArray = (highlights: Highlights): AnalysisHighlight[] => {
    return Object.entries(highlights).map(([key, title]) => ({
        title: typeof title === 'number' ? String(Math.round(title)) : String(title),
        description: HIGHLIGHT_TITLES[key] ?? 'Неизвестный параметр',
    }));
};

// Максимальный размер файла в байтах (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Допустимые MIME-типы для CSV файлов
const VALID_CSV_MIME_TYPES = [
    'text/csv',
    'application/csv',
    'text/comma-separated-values',
    'application/vnd.ms-excel', // Excel может сохранять CSV с таким типом
    'text/plain', // Некоторые системы определяют CSV как plain text
];

/**
 * Детальная информация об ошибке валидации файла
 */
export interface FileValidationError {
    isValid: false;
    errorType: 'extension' | 'mimeType' | 'size' | 'empty';
    message: string;
}

/**
 * Успешный результат валидации файла
 */
export interface FileValidationSuccess {
    isValid: true;
}

/**
 * Результат валидации файла
 */
export type FileValidationResult = FileValidationSuccess | FileValidationError;

/**
 * Проверяет, является ли файл валидным CSV
 * @param file - Файл для проверки
 * @returns Результат валидации с детальной информацией об ошибке
 */
export const validateCsvFile = (file: File): FileValidationResult => {
    // Проверка на пустой файл
    if (file.size === 0) {
        return {
            isValid: false,
            errorType: 'empty',
            message: 'Файл пустой или поврежден',
        };
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            errorType: 'size',
            message: `Размер файла превышает максимально допустимый (${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)`,
        };
    }

    // Проверка расширения файла
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
        return {
            isValid: false,
            errorType: 'extension',
            message: 'Можно загружать только *.csv файлы',
        };
    }

    // Проверка MIME-типа (если доступен)
    if (file.type && !VALID_CSV_MIME_TYPES.includes(file.type)) {
        return {
            isValid: false,
            errorType: 'mimeType',
            message: 'Неподдерживаемый тип файла. Загрузите корректный CSV файл',
        };
    }

    return { isValid: true };
};

/**
 * Проверяет, является ли файл CSV (упрощенная версия для обратной совместимости)
 * @param file - Файл для проверки
 * @returns true, если файл является валидным CSV, иначе false
 * @deprecated Используйте validateCsvFile для получения детальной информации об ошибке
 */
export const isCsvFile = (file: File): boolean => {
    const result = validateCsvFile(file);
    return result.isValid;
};
/**
 * Валидирует ответ сервера
 * @param rawData - Сырые данные от сервера
 * @returns true, если ответ валидный, иначе false
 */
export const validateServerResponse = (rawData: Record<string, string | number>): boolean => {
    const validHighlightKeys = Object.keys(HIGHLIGHT_TITLES);
    const responseHighlightKeys = Object.keys(rawData);

    return validHighlightKeys.some((key) => responseHighlightKeys.includes(key));
};
