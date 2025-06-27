// import { SVGProps } from 'react';

export type Highlights = {
    total_spend_galactic: number; // общие расходы в галактических кредитах
    rows_affected: number; // количество обработанных записей
    less_spent_at: number; // день года с минимальными расходами
    big_spent_at: number; // день года с максимальными расходами
    less_spent_value: number; // минимальная сумма расходов за день
    big_spent_value: number; // максимальная сумма расходов за день
    average_spend_galactic: number; // средние расходы в галактических кредитах
    big_spent_civ: string; // цивилизация с максимальными расходами
    less_spent_civ: string; // цивилизация с минимальными расходами
};