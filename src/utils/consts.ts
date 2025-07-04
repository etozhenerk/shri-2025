export const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'tableHistory';

export const API_HOST = process.env.API_HOST;

export const HIGHLIGHT_TITLES: Record<string, string> = {
    total_spend_galactic: 'Общие расходы',
    rows_affected: 'Обработано строк',
    less_spent_at: 'День min расходов',
    big_spent_at: 'День max расходов',
    less_spent_value: 'Min расходы в день',
    big_spent_value: 'Max расходы в день',
    average_spend_galactic: 'Средние расходы',
    big_spent_civ: 'Цивилизация max расходов',
    less_spent_civ: 'Цивилизация min расходов',
};
