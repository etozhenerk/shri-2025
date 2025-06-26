import { HistoryItemType } from '@app-types/history';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { STORAGE_KEY } from '../consts';
import { getHistory, addToHistory, removeFromHistory, clearHistory } from '../storage';

const MOCK_ITEM_BASE = { fileName: 'test.csv' };
const MOCK_HISTORY_ITEM: HistoryItemType = {
    ...MOCK_ITEM_BASE,
    id: '1',
    timestamp: 123456789,
};

describe('Утилиты для работы с localStorage', () => {
    // Мокаем localStorage
    const localStorageMock = (() => {
        let store: Record<string, string> = {};
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

    beforeEach(() => {
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });
        localStorageMock.clear();
        vi.spyOn(localStorageMock, 'getItem');
        vi.spyOn(localStorageMock, 'setItem');
        vi.spyOn(localStorageMock, 'removeItem');
    });

    describe('getHistory', () => {
        it('должна возвращать пустой массив, если история пуста', () => {
            expect(getHistory()).toEqual([]);
            expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
        });

        it('должна возвращать данные из localStorage, если они есть', () => {
            const history = [MOCK_HISTORY_ITEM];
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify(history));
            expect(getHistory()).toEqual(history);
        });

        it('должна возвращать пустой массив при ошибке парсинга JSON', () => {
            localStorageMock.setItem(STORAGE_KEY, 'невалидный-json');
            expect(getHistory()).toEqual([]);
        });
    });

    describe('addToHistory', () => {
        it('должна добавлять новый элемент в историю', () => {
            const newItem = addToHistory(MOCK_ITEM_BASE);
            expect(newItem).toMatchObject(MOCK_ITEM_BASE);
            expect(newItem).toHaveProperty('id');
            expect(newItem).toHaveProperty('timestamp');

            const history = getHistory();
            expect(history).toHaveLength(1);
            expect(history[0]).toEqual(newItem);
        });

        it('должна добавлять новый элемент в начало существующей истории', () => {
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify([MOCK_HISTORY_ITEM]));
            const newItem = addToHistory({ fileName: 'new.csv' });

            const history = getHistory();
            expect(history).toHaveLength(2);
            expect(history[0]).toEqual(newItem);
            expect(history[1]).toEqual(MOCK_HISTORY_ITEM);
        });
    });

    describe('removeFromHistory', () => {
        it('должна удалять элемент из истории по id', () => {
            const historyWithTwoItems = [MOCK_HISTORY_ITEM, { ...MOCK_HISTORY_ITEM, id: '2' }];
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify(historyWithTwoItems));

            removeFromHistory('1');

            const history = getHistory();
            expect(history).toHaveLength(1);
            expect(history[0].id).toBe('2');
        });

        it('не должна изменять историю, если id не найден', () => {
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify([MOCK_HISTORY_ITEM]));
            removeFromHistory('non-existent-id');
            expect(getHistory()).toEqual([MOCK_HISTORY_ITEM]);
        });
    });

    describe('clearHistory', () => {
        it('должна удалять ключ истории из localStorage', () => {
            localStorageMock.setItem(STORAGE_KEY, JSON.stringify([MOCK_HISTORY_ITEM]));
            clearHistory();
            expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
            expect(getHistory()).toEqual([]);
        });
    });
});
