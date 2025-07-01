#!/bin/bash

# Скрипт для запуска всех тестов Playwright несколько раз.
# Используется для выявления "flaky" (нестабильных) тестов.

REPEAT_COUNT=20

echo "Запуск всех тестов."
echo "Количество полных прогонов: $REPEAT_COUNT"
echo "----------------------------------------------------"

# Запускаем тесты
npx playwright test tests --repeat-each "$REPEAT_COUNT" 