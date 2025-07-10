/**
 * Интеграционное тестирование React страницы.
 *
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. Integration Testing: тестирование взаимодействия между компонентами
 * 2. Store Integration: интеграция с Zustand store и управление состоянием
 * 3. Router Testing: использование MemoryRouter для тестирования навигации
 * 4. User Interactions: симуляция действий пользователя (загрузка файлов, клики)
 * 5. API Mocking: мокирование fetch для тестирования error handling
 *
 * ОТЛИЧИЯ ОТ E2E ТЕСТОВ:
 * - Быстрее (миллисекунды vs секунды)
 * - Более стабильные (нет browser quirks)
 * - Легче debuggинг
 * - Нет реальной сети, браузерных API, визуальных проверок
 *
 * ОТЛИЧИЯ ОТ UNIT ТЕСТОВ:
 * - Тестируют интеграцию компонентов, а не изолированную логику
 * - Проверяют пользовательские сценарии
 * - Включают проверку DOM и user interactions
 */
import { useAnalysisStore } from '@store/analysisStore';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { HomePage } from '../HomePage';

// ВАЖНО: Получаем initial state перед любыми изменениями
const initialAnalysisState = useAnalysisStore.getState();

describe('Интеграционные тесты для HomePage', () => {
    /**
     * SETUP И CLEANUP
     *
     * В интеграционных тестах критично обеспечить изоляцию:
     * каждый тест должен начинаться с чистого состояния store.
     */
    beforeEach(() => {
        // Сбрасываем состояние стора перед каждым тестом
        // Второй параметр 'true' означает полную замену состояния
        useAnalysisStore.setState(initialAnalysisState, true);
    });

    /**
     * ТЕСТ-КЕЙС: ВАЛИДАЦИЯ ФАЙЛОВ
     *
     * Проверяет интеграцию между:
     * - Dropzone компонентом (загрузка файлов)
     * - Validation логикой (проверка расширения)
     * - UI feedback (отображение ошибок)
     */
    it('TC-HP-003: Попытка загрузки файла с неверным расширением', async () => {
        // ARRANGE: Рендерим страницу в routing контексте
        // MemoryRouter необходим для компонентов, использующих Link/Navigate
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HomePage />
            </MemoryRouter>
        );

        // ACT: Симулируем загрузку невалидного файла
        const fileInput = screen.getByTestId('dropzone-input');
        const invalidFile = new File(['hello'], 'invalid-file.txt', { type: 'text/plain' });

        // fireEvent.change симулирует изменение input[type="file"]
        fireEvent.change(fileInput, {
            target: { files: [invalidFile] },
        });

        // ASSERT: Проверяем что ошибка валидации отображается в UI
        const errorMessage = await screen.findByText('Можно загружать только *.csv файлы');
        expect(errorMessage).toBeInTheDocument();
    });

    /**
     * ТЕСТ-КЕЙС: CONDITIONAL RENDERING
     *
     * Проверяет что UI корректно реагирует на состояние:
     * кнопка отправки появляется только после выбора файла.
     */
    it('TC-HP-004: Кнопка "Отправить" неактивна до выбора файла', async () => {
        // ARRANGE: Рендерим страницу без файла
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HomePage />
            </MemoryRouter>
        );

        // ASSERT: Кнопка отправки не должна существовать в DOM
        const sendButton = screen.queryByTestId('send-button');
        expect(sendButton).not.toBeInTheDocument();
    });

    /**
     * ТЕСТ-КЕЙС: ERROR HANDLING И API INTEGRATION
     *
     * Тестирование:
     * - Мокирования fetch API
     * - Обработки ошибок сервера
     * - Отображения feedback пользователю
     * - Асинхронных операций с waitFor
     */
    it('TC-HP-005: Отображение ошибки при сбое обработки на сервере', async () => {
        // ARRANGE: Настраиваем mock для fetch API
        const errorMessage = 'Неизвестная ошибка парсинга :(';

        // Мокируем fetch для симуляции ошибки сервера
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ message: errorMessage }),
            })
        );

        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HomePage />
            </MemoryRouter>
        );

        // ACT: Загружаем валидный файл и отправляем на сервер
        const fileInput = screen.getByTestId('dropzone-input');
        const validFile = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(fileInput, { target: { files: [validFile] } });

        // Дожидаемся появления кнопки отправки
        const sendButton = await screen.findByTestId('send-button');
        fireEvent.click(sendButton);

        // ASSERT: Проверяем отображение ошибки асинхронно
        // waitFor ожидает появления элемента с таймаутом
        await waitFor(() => {
            const error = screen.getByText(errorMessage);
            expect(error).toBeInTheDocument();
        });
    });

    /**
     * ТЕСТ-КЕЙС: STATE TRANSITIONS
     *
     * Проверяет полный пользовательский флоу:
     * загрузка файла → отображение имени → очистка → возврат к исходному состоянию
     */
    it('TC-HP-006: Сброс выбранного файла', async () => {
        // ARRANGE
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HomePage />
            </MemoryRouter>
        );

        // ACT: Загружаем файл
        const fileInput = screen.getByTestId('dropzone-input');
        const validFile = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(fileInput, { target: { files: [validFile] } });

        // ASSERT: Проверяем что файл отображается
        const fileNameElementBefore = await screen.findByText('test.csv');
        expect(fileNameElementBefore).toBeInTheDocument();

        // ACT: Очищаем файл
        const clearButton = screen.getByTestId('dropzone-clear-button');
        fireEvent.click(clearButton);

        // ASSERT: Проверяем что UI вернулось к исходному состоянию
        const fileNameElementAfter = screen.queryByText('test.csv');
        expect(fileNameElementAfter).not.toBeInTheDocument();

        const sendButton = screen.queryByTestId('send-button');
        expect(sendButton).not.toBeInTheDocument();
    });
});
