#!/bin/bash

# Скрипт для запуска ВСЕХ тестов Playwright несколько раз подряд.
# Используется для массовой проверки на "flakiness" (нестабильность).

REPEAT_COUNT=20

echo "Запуск всех тестов."
echo "Количество полных прогонов: $REPEAT_COUNT"
echo "----------------------------------------------------"

for i in $(seq 1 $REPEAT_COUNT); do
    echo "Прогон $i из $REPEAT_COUNT..."
    npx playwright test
    if [ $? -ne 0 ]; then
        echo "Тесты упали на прогоне $i. Выполнение остановлено."
        exit 1
    fi
done

echo "Все $REPEAT_COUNT прогонов успешно завершены."
exit 0 