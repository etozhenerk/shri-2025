/**
 * Интеграционное тестирование страницы генерации отчетов.
 *
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. Error State Testing: тестирование обработки ошибок API
 * 2. Button State Management: проверка состояний кнопок (loading, disabled, enabled)
 * 3. Server Error Simulation: мокирование различных типов ошибок сервера
 * 4. User Feedback: проверка отображения сообщений об ошибках
 * 5. State Recovery: проверка восстановления UI после ошибок
 *
 * ОТЛИЧИЯ ОТ HOMEPAGE ТЕСТОВ:
 * - Фокус на генерации отчетов, а не анализе данных
 * - Тестирование кнопок вместо file upload
 * - Проверка download functionality
 * - Другие типы ошибок (generation vs parsing)
 *
 * ИНТЕГРАЦИОННЫЕ АСПЕКТЫ:
 * - Взаимодействие с API генерации
 * - UI state management при асинхронных операциях
 * - Error boundary behavior
 * - User experience при сбоях
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { GeneratePage } from '../';

describe('Интеграционные тесты для GeneratePage', () => {
    /**
     * ТЕСТ-КЕЙС: SERVER ERROR HANDLING
     *
     * Важные аспекты обработки ошибок:
     * 1. Мокирование различных HTTP статус кодов
     * 2. Проверка отображения пользовательских сообщений об ошибках
     * 3. Проверка восстановления UI состояния после ошибки
     * 4. Тестирование асинхронных операций с waitFor
     */
    it('TC-GP-002: Отображение ошибки при сбое генерации на сервере', async () => {
        // ARRANGE: Настраиваем mock для симуляции серверной ошибки
        const errorText = 'Произошла серьезная ошибка';

        // Мокируем fetch для возврата 500 Internal Server Error
        // Это типичная ошибка когда сервер не может сгенерировать отчет
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false, // Указывает что запрос неуспешен
                status: 500, // HTTP статус код ошибки сервера
                json: () => Promise.resolve({ error: errorText }),
            })
        );

        // Рендерим страницу в routing контексте
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <GeneratePage />
            </MemoryRouter>
        );

        // ACT: Симулируем клик по кнопке генерации
        const generateButton = screen.getByTestId('generate-button');
        fireEvent.click(generateButton);

        // ASSERT: Проверяем обработку ошибки
        // waitFor ожидает асинхронного появления элемента с ошибкой
        await waitFor(() => {
            const errorMessage = screen.getByText(`Произошла ошибка: ${errorText}`);
            expect(errorMessage).toBeInTheDocument();
        });

        // ВАЖНО: Проверяем что кнопка восстановила свое состояние
        // После ошибки пользователь должен иметь возможность попробовать снова
        expect(generateButton).toBeEnabled();
    });
});
