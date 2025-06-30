import { describe, expect, it } from 'vitest';

import { formatDate } from '../formatDate';

describe('Утилита formatDate', () => {
    it('должна форматировать дату, добавляя ведущие нули для дня и месяца', () => {
        const date = new Date('2024-01-05T10:00:00');
        expect(formatDate(date)).toBe('05.01.2024');
    });

    it('должна форматировать дату без добавления ведущих нулей для дня и месяца', () => {
        const date = new Date('2024-10-15T10:00:00');
        expect(formatDate(date)).toBe('15.10.2024');
    });

    it('должна корректно обрабатывать часовые пояса, основываясь на локальных компонентах даты', () => {
        const date = new Date('2024-01-01T02:00:00+03:00');
        expect(formatDate(date)).toBe('01.01.2024');
    });

    it('должна корректно обрабатывать начало месяца', () => {
        const date = new Date('2024-03-01T10:00:00');
        expect(formatDate(date)).toBe('01.03.2024');
    });

    it('должна корректно обрабатывать конец месяца', () => {
        const date = new Date('2024-02-29T10:00:00'); // Високосный год
        expect(formatDate(date)).toBe('29.02.2024');
    });

    it('должна корректно форматировать дату из числового таймстампа', () => {
        // 1 января 2024 года
        const timestamp = 1704067200000;
        expect(formatDate(timestamp)).toBe('01.01.2024');
    });
}); 