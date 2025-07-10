/**
 * Преобразует таймстамп в строку формата "ДД.ММ.ГГГГ"
 * @param timestamp - Таймстамп в миллисекундах или объект Date
 * @returns Строка с датой в формате "ДД.ММ.ГГГГ" или "Invalid Date" для невалидных дат
 */
export const formatDate = (timestamp: number | Date): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Проверяем валидность даты
    const time = date.getTime();
    if (isNaN(time)) {
        return 'Invalid Date';
    }

    // Проверяем что дата в допустимых пределах JavaScript Date
    if (time < -8640000000000000 || time > 8640000000000000) {
        return 'Invalid Date';
    }

    const dayNum = date.getDate();
    const monthNum = date.getMonth() + 1; // +1, т.к. месяцы начинаются с 0
    const year = date.getFullYear();

    // Дополнительная проверка на корректность компонентов даты
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(year)) {
        return 'Invalid Date';
    }

    // Проверяем разумные границы года (от 1 до 9999)
    if (year < 1 || year > 9999) {
        return 'Invalid Date';
    }

    const day = dayNum.toString().padStart(2, '0');
    const month = monthNum.toString().padStart(2, '0');

    return `${day}.${month}.${year}`;
};
