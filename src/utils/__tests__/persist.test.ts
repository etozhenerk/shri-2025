import { describe, it, expect } from 'vitest';

import { createPersistConfig } from './persist';

describe('Утилита createPersistConfig', () => {
    it('должна создавать конфигурацию с правильным именем', () => {
        const config = createPersistConfig('my-storage', []);
        expect(config.name).toBe('my-storage');
    });

    it('должна создавать функцию partialize, которая отбирает только указанные ключи', () => {
        const persistedKeys = ['a', 'c'];
        const config = createPersistConfig('test', persistedKeys);

        const fullState = {
            a: 1,
            b: 'some-value',
            c: true,
            d: { nested: 'object' },
        };

        const partialState = config.partialize?.(fullState);

        expect(partialState).toEqual({ a: 1, c: true });
    });

    it('должна возвращать пустой объект, если не указано ключей для сохранения', () => {
        const config = createPersistConfig('test', []);
        const fullState = { a: 1, b: 2 };
        const partialState = config.partialize?.(fullState);
        expect(partialState).toEqual({});
    });

    it('должна возвращать пустой объект, если исходное состояние пустое', () => {
        const config = createPersistConfig<{ a?: number }>('test', ['a']);
        const fullState: { a?: number } = {};
        const partialState = config.partialize?.(fullState);
        expect(partialState).toEqual({});
    });

    it('должна корректно работать с ключами, которых нет в исходном состоянии', () => {
        const persistedKeys = ['a', 'z']; // 'z' не существует в fullState
        const config = createPersistConfig('test', persistedKeys);
        const fullState = { a: 1, b: 2 };
        const partialState = config.partialize?.(fullState);
        expect(partialState).toEqual({ a: 1 });
    });
}); 