/**
 * Тестирование утилиты для конфигурации персистенса данных.
 *
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. Configuration Factories: функции-фабрики для создания конфигураций
 * 2. State Persistence: сохранение части состояния в localStorage
 * 3. Partial State Selection: выборочное сохранение ключей объекта
 * 4. Object Manipulation: операции pick/select для объектов
 * 5. Type Safety: работа с типизированными состояниями
 *
 * ПАТТЕРНЫ ТЕСТИРОВАНИЯ:
 * - Factory Function Testing: проверка корректности создания конфигураций
 * - Selector Testing: тестирование функций выбора/фильтрации данных
 * - Edge Cases: пустые объекты, несуществующие ключи
 * - Data Integrity: проверка что функция не мутирует исходные данные
 * - Type Constraints: тестирование поведения с различными типами
 *
 * ПОЧЕМУ ЭТО ВАЖНО:
 * Персистенс состояния критичен для UX - пользователи ожидают,
 * что их данные сохранятся между сессиями. Но сохранять нужно
 * только необходимые данные для производительности.
 */
import { describe, it, expect } from 'vitest';

import { createPersistConfig } from '../persist';

describe('Утилита createPersistConfig', () => {
    /**
     * ТЕСТИРОВАНИЕ СОЗДАНИЯ КОНФИГУРАЦИИ
     *
     * Проверяем что factory function правильно создает базовую конфигурацию
     * с заданным именем для localStorage key.
     */
    it('должна создавать конфигурацию с правильным именем', () => {
        // ARRANGE & ACT: Создаем конфигурацию с указанным именем
        const config = createPersistConfig('my-storage', []);

        // ASSERT: Имя должно быть установлено правильно для localStorage key
        expect(config.name).toBe('my-storage');
    });

    /**
     * ТЕСТИРОВАНИЕ СЕЛЕКТОРА СОСТОЯНИЯ (PARTIALIZE FUNCTION)
     *
     * Главная функциональность - выборочное сохранение только указанных ключей.
     * Это критично для производительности и приватности данных.
     */
    it('должна создавать функцию partialize, которая отбирает только указанные ключи', () => {
        // ARRANGE: Настраиваем конфигурацию для сохранения только ключей 'a' и 'c'
        const persistedKeys = ['a', 'c'];
        const config = createPersistConfig('test', persistedKeys);

        // Создаем полное состояние с разными типами данных
        const fullState = {
            a: 1, // Числовое значение - должно сохраниться
            b: 'some-value', // Строка - НЕ должна сохраниться
            c: true, // Boolean - должен сохраниться
            d: { nested: 'object' }, // Объект - НЕ должен сохраниться
        };

        // ACT: Применяем функцию partialize для выбора нужных ключей
        const partialState = config.partialize?.(fullState);

        // ASSERT: Должны остаться только выбранные ключи
        expect(partialState).toEqual({ a: 1, c: true });

        // ВАЖНО: Проверяем что исходный объект не был мутирован
        expect(fullState).toEqual({
            a: 1,
            b: 'some-value',
            c: true,
            d: { nested: 'object' },
        });
    });

    /**
     * ТЕСТИРОВАНИЕ EDGE CASE: ПУСТОЙ СПИСОК КЛЮЧЕЙ
     *
     * Проверяем поведение когда не указано ключей для сохранения.
     * Должен возвращаться пустой объект.
     */
    it('должна возвращать пустой объект, если не указано ключей для сохранения', () => {
        // ARRANGE: Конфигурация без ключей для персистенса
        const config = createPersistConfig('test', []);
        const fullState = { a: 1, b: 2 };

        // ACT: Применяем partialize к непустому состоянию
        const partialState = config.partialize?.(fullState);

        // ASSERT: Результат должен быть пустым объектом
        expect(partialState).toEqual({});
    });

    /**
     * ТЕСТИРОВАНИЕ EDGE CASE: ПУСТОЕ ИСХОДНОЕ СОСТОЯНИЕ
     *
     * Проверяем поведение с пустым входным объектом.
     * Работа с TypeScript generic constraints.
     */
    it('должна возвращать пустой объект, если исходное состояние пустое', () => {
        // ARRANGE: Используем TypeScript generics для типизации
        const config = createPersistConfig<{ a?: number }>('test', ['a']);
        const fullState: { a?: number } = {}; // Пустой объект

        // ACT
        const partialState = config.partialize?.(fullState);

        // ASSERT: Пустое состояние должно давать пустой результат
        expect(partialState).toEqual({});
    });

    /**
     * ТЕСТИРОВАНИЕ EDGE CASE: НЕСУЩЕСТВУЮЩИЕ КЛЮЧИ
     *
     * Проверяем robustness функции - что происходит когда запрашиваем
     * ключи которых нет в исходном объекте.
     */
    it('должна корректно работать с ключами, которых нет в исходном состоянии', () => {
        // ARRANGE: Запрашиваем ключ 'z' который не существует в fullState
        const persistedKeys = ['a', 'z']; // 'z' не существует в fullState
        const config = createPersistConfig('test', persistedKeys);
        const fullState = { a: 1, b: 2 };

        // ACT
        const partialState = config.partialize?.(fullState);

        // ASSERT: Должен быть включен только существующий ключ 'a'
        // Несуществующий ключ 'z' должен быть проигнорирован
        expect(partialState).toEqual({ a: 1 });

        // ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА: в результате не должно быть undefined значений
        expect(Object.hasOwnProperty.call(partialState, 'z')).toBe(false);
    });
});
