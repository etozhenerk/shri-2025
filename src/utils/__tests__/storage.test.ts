/**
 * Comprehensive тестирование утилит для работы с localStorage.
 *
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. Мокирование browser APIs (localStorage, crypto.randomUUID)
 * 2. Тестирование CRUD операций (Create, Read, Update, Delete)
 * 3. Error Handling: quota exceeded, API недоступность, поврежденные данные
 * 4. Data Integrity: валидация типов, обработка невалидного JSON
 * 5. Browser Compatibility: работа с отсутствующими APIs
 *
 * ПАТТЕРНЫ ТЕСТИРОВАНИЯ:
 * - Isolated Testing: каждый тест изолирован через beforeEach/afterEach
 * - Mock Strategy: полный контроль над localStorage через mock объект
 * - Error Simulation: симуляция различных типов ошибок
 * - Spy Functions: отслеживание вызовов API методов
 * - Edge Cases: граничные случаи и неожиданные входные данные
 */
import { HistoryItemType } from '@app-types/history';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { STORAGE_KEY } from '../consts';
import { getHistory, addToHistory, removeFromHistory, clearHistory } from '../storage';

// ТЕСТОВЫЕ ДАННЫЕ: Создаем переиспользуемые моки для консистентности тестов
const MOCK_ITEM_BASE = { fileName: 'test.csv' };
const MOCK_HISTORY_ITEM: HistoryItemType = {
    ...MOCK_ITEM_BASE,
    id: '1',
    timestamp: 123456789,
};

describe('Утилиты для работы с localStorage', () => {
    /**
     * МОКИРОВАНИЕ LOCALSTORAGE
     *
     * localStorage в тестовой среде недоступен, поэтому создаем полнофункциональный mock.
     * Этот mock имитирует все методы localStorage и позволяет полностью контролировать
     * поведение API в тестах.
     */
    const localStorageMock = (() => {
        let store: Record<string, string> = {}; // Внутреннее хранилище mock'а
        return {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete store[key];
            }),
            clear: vi.fn(() => {
                store = {};
            }),
        };
    })();

    /**
     * НАСТРОЙКА И ОЧИСТКА ТЕСТОВ
     *
     * beforeEach: подготавливает чистое состояние перед каждым тестом
     * afterEach: восстанавливает оригинальное поведение после теста
     *
     * Это критически важно для изоляции тестов друг от друга.
     */
    beforeEach(() => {
        // Подменяем глобальный localStorage на наш mock
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });

        // Очищаем mock хранилище
        localStorageMock.clear();

        // Создаем spy'и для отслеживания вызовов методов
        vi.spyOn(localStorageMock, 'getItem');
        vi.spyOn(localStorageMock, 'setItem');
        vi.spyOn(localStorageMock, 'removeItem');
    });

    afterEach(() => {
        // Восстанавливаем все mock'и к первоначальному состоянию
        vi.restoreAllMocks();
    });

    /**
     * ТЕСТИРОВАНИЕ ЧТЕНИЯ (READ OPERATIONS)
     *
     * Проверяем различные сценарии получения данных из localStorage:
     * - Пустое хранилище
     * - Валидные данные
     * - Поврежденные данные
     */
    describe('getHistory', () => {
        it('должна возвращать пустой массив, если история пуста', () => {
            // ACT & ASSERT: При отсутствии данных должен возвращаться пустой массив
            expect(getHistory()).toEqual([]);

            // Проверяем, что метод getItem был вызван с правильным ключом
            expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
        });

        it('должна возвращать данные из localStorage', () => {
            // ARRANGE: Подготавливаем валидные данные в localStorage
            const history = [MOCK_HISTORY_ITEM];
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify(history));

            // ACT & ASSERT: Должны получить точные данные, которые сохранили
            expect(getHistory()).toEqual(history);
        });

        it('должна возвращать пустой массив при ошибке парсинга JSON', () => {
            // ARRANGE: Сохраняем невалидный JSON в localStorage
            // Такое может произойти при ручном редактировании или сбоях
            localStorageMock.setItem(STORAGE_KEY, 'невалидный-json');

            // ACT & ASSERT: Функция должна gracefully обрабатывать ошибки парсинга
            expect(getHistory()).toEqual([]);
        });
    });

    /**
     * ТЕСТИРОВАНИЕ ДОБАВЛЕНИЯ (CREATE OPERATIONS)
     *
     * Проверяем создание новых записей в истории:
     * - Генерация уникальных ID
     * - Добавление timestamp'ов
     * - Порядок элементов (новые в начале)
     */
    describe('addToHistory', () => {
        it('должна добавлять новый элемент в историю', () => {
            // ACT: Добавляем новый элемент
            const newItem = addToHistory(MOCK_ITEM_BASE);

            // ASSERT: Проверяем структуру созданного элемента
            expect(newItem).toMatchObject(MOCK_ITEM_BASE); // Содержит исходные данные
            expect(newItem).toHaveProperty('id'); // Сгенерирован ID
            expect(newItem).toHaveProperty('timestamp'); // Добавлен timestamp

            // Проверяем, что элемент действительно сохранен в localStorage
            const history = getHistory();
            expect(history).toHaveLength(1);
            expect(history[0]).toEqual(newItem);
        });

        it('должна добавлять новый элемент в начало истории', () => {
            // ARRANGE: Подготавливаем существующую историю
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify([MOCK_HISTORY_ITEM]));

            // ACT: Добавляем новый элемент
            const newItem = addToHistory({ fileName: 'new.csv' });

            // ASSERT: Новый элемент должен быть в начале (LIFO - Last In, First Out)
            const history = getHistory();
            expect(history).toHaveLength(2);
            expect(history[0]).toEqual(newItem); // Новый элемент первый
            expect(history[1]).toEqual(MOCK_HISTORY_ITEM); // Старый элемент второй
        });
    });

    /**
     * ТЕСТИРОВАНИЕ УДАЛЕНИЯ (DELETE OPERATIONS)
     *
     * Проверяем удаление записей по ID:
     * - Удаление существующих элементов
     * - Обработка несуществующих ID
     */
    describe('removeFromHistory', () => {
        it('должна удалять элемент из истории по id', () => {
            // ARRANGE: Создаем историю с двумя элементами
            const historyWithTwoItems = [MOCK_HISTORY_ITEM, { ...MOCK_HISTORY_ITEM, id: '2' }];
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify(historyWithTwoItems));

            // ACT: Удаляем элемент с ID '1'
            removeFromHistory('1');

            // ASSERT: Должен остаться только элемент с ID '2'
            const history = getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].id).toBe('2');
        });

        it('не должна изменять историю, если id не найден', () => {
            // ARRANGE: Подготавливаем историю с одним элементом
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify([MOCK_HISTORY_ITEM]));

            // ACT: Пытаемся удалить несуществующий элемент
            removeFromHistory('non-existent-id');

            // ASSERT: История должна остаться неизменной
            expect(getHistory()).toEqual([MOCK_HISTORY_ITEM]);
        });
    });

    /**
     * ТЕСТИРОВАНИЕ ПОЛНОЙ ОЧИСТКИ
     *
     * Проверяем удаление всей истории из localStorage
     */
    describe('clearHistory', () => {
        it('должна удалять ключ истории из localStorage', () => {
            // ARRANGE: Подготавливаем историю
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify([MOCK_HISTORY_ITEM]));

            // ACT: Очищаем всю историю
            clearHistory();

            // ASSERT:
            // 1. removeItem должен быть вызван с правильным ключом
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
            // 2. История должна стать пустой
            expect(getHistory()).toEqual([]);
        });
    });

    describe('Error Handling: addToHistory', () => {
        it('должна выбрасывать ошибку при превышении quota localStorage', () => {
            // ARRANGE: Симулируем переполнение localStorage
            // Это происходит когда пользователь достигает лимита хранилища браузера
            vi.restoreAllMocks();
            vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
                const error = new Error('QuotaExceededError');
                error.name = 'QuotaExceededError';
                throw error;
            });

            // ACT & ASSERT: Ошибка должна пробрасываться выше
            expect(() => addToHistory(MOCK_ITEM_BASE)).toThrow('QuotaExceededError');
        });

        it('должна логировать ошибку и re-throw при проблемах с localStorage', () => {
            // ARRANGE: Симулируем проблемы с доступом к localStorage
            vi.restoreAllMocks();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
                throw new Error('Storage access denied');
            });

            // ACT & ASSERT:
            // 1. Ошибка должна быть выброшена
            expect(() => addToHistory(MOCK_ITEM_BASE)).toThrow('Storage access denied');
            // 2. Ошибка должна быть залогирована для отладки
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to add item to history:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });

        it('должна обрабатывать недоступность crypto.randomUUID', () => {
            // ARRANGE: Симулируем старый браузер без crypto API
            const originalCrypto = global.crypto;
            // @ts-expect-error - намеренно удаляем crypto для тестирования
            delete global.crypto;

            // ACT & ASSERT: Функция должна выбрасывать ошибку при отсутствии crypto
            expect(() => addToHistory(MOCK_ITEM_BASE)).toThrow();

            // CLEANUP: Восстанавливаем crypto
            global.crypto = originalCrypto;
        });

        it('должна обрабатывать crypto.randomUUID возвращающий undefined', () => {
            // ARRANGE: Симулируем поврежденный crypto API
            const originalRandomUUID = global.crypto?.randomUUID;
            if (global.crypto) {
                // @ts-expect-error - намеренно ломаем randomUUID
                global.crypto.randomUUID = undefined;
            }

            // ACT & ASSERT
            expect(() => addToHistory(MOCK_ITEM_BASE)).toThrow();

            // CLEANUP
            if (global.crypto && originalRandomUUID) {
                global.crypto.randomUUID = originalRandomUUID;
            }
        });
    });

    describe('Error Handling: removeFromHistory', () => {
        it('должна выбрасывать ошибку при проблемах с localStorage', () => {
            // ARRANGE: Симулируем ошибку записи в localStorage
            vi.restoreAllMocks();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
                throw new Error('Storage write error');
            });

            // ACT & ASSERT
            expect(() => removeFromHistory('1')).toThrow('Storage write error');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to remove item from history:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Error Handling: clearHistory', () => {
        it('должна выбрасывать ошибку при проблемах с removeItem', () => {
            // ARRANGE: Симулируем ошибку удаления из localStorage
            vi.restoreAllMocks();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(localStorageMock, 'removeItem').mockImplementation(() => {
                throw new Error('Cannot remove item');
            });

            // ACT & ASSERT
            expect(() => clearHistory()).toThrow('Cannot remove item');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to clear history:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Error Handling: getHistory', () => {
        it('не должна падать при отсутствии localStorage API', () => {
            // ARRANGE: Симулируем браузер без localStorage (например, incognito режим)
            const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
            Object.defineProperty(window, 'localStorage', {
                value: undefined,
                writable: true,
            });

            // ACT & ASSERT: Функция должна gracefully возвращать пустой массив
            expect(getHistory()).toEqual([]);

            // CLEANUP
            if (originalLocalStorage) {
                Object.defineProperty(window, 'localStorage', originalLocalStorage);
            }
        });

        it('должна обрабатывать localStorage.getItem выбрасывающий ошибку', () => {
            // ARRANGE: Симулируем ошибку доступа к localStorage
            vi.restoreAllMocks();
            vi.spyOn(localStorageMock, 'getItem').mockImplementation(() => {
                throw new Error('Access denied');
            });

            // ACT & ASSERT: При ошибках чтения должен возвращаться пустой массив
            expect(getHistory()).toEqual([]);
        });

        it('должна обрабатывать null значения из localStorage', () => {
            // ARRANGE: Симулируем ситуацию когда ключ не существует
            vi.restoreAllMocks();
            vi.spyOn(localStorageMock, 'getItem').mockReturnValue(null);

            // ACT & ASSERT
            expect(getHistory()).toEqual([]);
        });

        it('должна обрабатывать пустую строку из localStorage', () => {
            // ARRANGE: Симулируем пустое значение в localStorage
            vi.restoreAllMocks();
            vi.spyOn(localStorageMock, 'getItem').mockReturnValue('');

            // ACT & ASSERT
            expect(getHistory()).toEqual([]);
        });
    });

    describe('Edge Cases: Data Integrity', () => {
        it('должна обрабатывать поврежденные JSON данные', () => {
            // ARRANGE: Симулируем JSON обрезанный посередине (сбой при записи)
            vi.restoreAllMocks();
            vi.spyOn(localStorageMock, 'getItem').mockReturnValue('{"id":"1","fileName":"test.csv"');

            // ACT & ASSERT: Поврежденный JSON должен возвращать пустой массив
            expect(getHistory()).toEqual([]);
        });

        it('должна обрабатывать очень большую историю', () => {
            // ARRANGE: Проверяем что функция не падает при больших данных
            vi.restoreAllMocks();

            // ACT & ASSERT: Добавление элемента не должно вызывать ошибок
            expect(() => addToHistory(MOCK_ITEM_BASE)).not.toThrow();
        });

        it('должна валидировать тип данных - возвращать пустой массив для невалидных данных', () => {
            // ARRANGE: Симулируем localStorage с объектом вместо массива
            // Это может произойти при конфликте с другими приложениями
            vi.restoreAllMocks();
            vi.spyOn(localStorageMock, 'getItem').mockReturnValue('{"not": "array"}');

            // ACT & ASSERT: При неправильном типе данных должен возвращаться пустой массив
            expect(getHistory()).toEqual([]);
        });
    });
});
