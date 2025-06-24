import { expect, test } from '../support/fixtures';

test.beforeEach(async ({ actions }) => {
    await actions.generate.goto();
});

test('TC-GEN-001: Успешная генерация отчета', async ({ pages, mocker, actions }) => {
    const successMessage = 'Отчёт успешно сгенерирован!';

    // Предусловие: Мокируем успешный ответ API для скачивания файла
    await mocker.mock('**/report*', 'col1,col2\\nval1,val2', {
        status: 200,
        contentType: 'text/csv',
        headers: {
            'Content-Disposition': 'attachment; filename="report.csv"',
        },
        delay: 200,
    });

    await test.step('Шаг 1: Нажатие на кнопку генерации и проверка состояния загрузки', async () => {
        await actions.generate.startGeneration();

        await expect(pages.generate.generateButton).toBeDisabled();
        await expect(pages.generate.loader).toBeVisible();
    });

    await test.step('Шаг 2: Проверка успешного результата', async () => {
        await expect(pages.generate.successMessage).toBeVisible({ timeout: 10000 });
        await expect(pages.generate.successMessage).toHaveText(successMessage);

        await expect(pages.generate.generateButton).toBeEnabled();
    });
});

test('TC-GEN-002: Ошибка при генерации отчета', async ({ pages, mocker, actions }) => {
    const errorText = 'Произошла серьезная ошибка';
    const expectedErrorMessage = `Произошла ошибка: ${errorText}`;

    // Предусловие: Мокируем ответ API с ошибкой
    await mocker.mock('**/report*', { error: errorText }, { status: 500, delay: 200 });

    await test.step('Шаг 1: Нажатие на кнопку генерации и проверка состояния загрузки', async () => {
        await actions.generate.startGeneration();

        await expect(pages.generate.generateButton).toBeDisabled();
        await expect(pages.generate.loader).toBeVisible();
    });

    await test.step('Шаг 2: Проверка сообщения об ошибке', async () => {
        await expect(pages.generate.errorMessage).toBeVisible({ timeout: 10000 });
        await expect(pages.generate.errorMessage).toHaveText(expectedErrorMessage);

        await expect(pages.generate.generateButton).toBeEnabled();
    });
});
