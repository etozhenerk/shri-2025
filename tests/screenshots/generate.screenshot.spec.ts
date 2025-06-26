import { expect } from '@playwright/test';

import { test } from '../support/fixtures';

test('TC-GP-003: Скриншот состояния страницы "Генерация" в состоянии по умолчанию', async ({
    page,
}) => {
    await page.goto('/generate');

    await test.step('Шаг 1: Сделать и сравнить скриншот страницы', async () => {
        await expect(page).toHaveScreenshot('generate-page.png', { fullPage: true });
    });
}); 