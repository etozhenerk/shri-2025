/**
 * Комплексное интеграционное тестирование страницы с CRUD операциями.
 *
 * КЛЮЧЕВЫЕ КОНЦЕПЦИИ:
 * 1. CRUD Testing: Create, Read, Update, Delete операции с историей
 * 2. LocalStorage Integration: тестирование персистенции данных
 * 3. Modal Dialog Testing: открытие/закрытие модальных окон
 * 4. Navigation Testing: тестирование переходов между страницами
 * 5. State Synchronization: синхронизация между store и localStorage
 * 6. Conditional Rendering: отображение разных состояний UI
 *
 * СЛОЖНЫЕ ИНТЕГРАЦИОННЫЕ СЦЕНАРИИ:
 * - Взаимодействие Store ↔ LocalStorage ↔ UI
 * - Routing между страницами
 * - Modal lifecycle management
 * - Empty states и populated states
 * - Bulk operations (clear all)
 *
 * ADVANCED PATTERNS:
 * - Custom localStorage mock для контроля data persistence
 * - Multi-route testing с Routes configuration
 * - Dynamic content testing (количество элементов)
 * - Negative testing (error states)
 */
import { GeneratePage } from '@pages/Generate';
import { useHistoryStore } from '@store/historyStore';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { historyMock } from '@tests/test-data/mocks/history';
import { STORAGE_KEY } from '@utils/consts';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';

import { HistoryPage } from '../HistoryPage';

// Мокируем localStorage с дополнительными возможностями
const localStorageMock = (() => {
    let store: Record<string, string> = {}; // Внутреннее хранилище mock'а
    return {
        getItem(key: string) {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        },
        // ДОПОЛНИТЕЛЬНЫЙ МЕТОД: для отладки в тестах
        getStore() {
            return store;
        },
    };
})();

// Подменяем глобальный localStorage на наш контролируемый mock
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Сохраняем initial state для сброса между тестами
const initialHistoryState = useHistoryStore.getState();

describe('Интеграционные тесты для HistoryPage', () => {
    /**
     * SETUP: КОМПЛЕКСНАЯ ПОДГОТОВКА ДАННЫХ
     *
     * В отличие от простых unit тестов, здесь мы настраиваем
     * сразу несколько уровней состояния:
     * 1. LocalStorage с тестовыми данными
     * 2. Store state reset
     * 3. Mock data population
     */
    beforeEach(() => {
        // 1. Очищаем localStorage и заполняем тестовыми данными
        localStorageMock.clear();
        localStorageMock.setItem(STORAGE_KEY, JSON.stringify(historyMock));

        // 2. Сбрасываем состояние стора перед каждым тестом
        // true означает полную замену состояния, а не merge
        useHistoryStore.setState(initialHistoryState, true);
    });

    /**
     * ТЕСТ-КЕЙС: READ OPERATIONS
     *
     * Проверяет базовое отображение данных из localStorage в UI.
     * Интеграция: LocalStorage → Store → Component → DOM
     */
    it('TC-HY-001: Отображение списка записей в истории', async () => {
        // ARRANGE: Рендерим страницу (данные уже в localStorage из beforeEach)
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HistoryPage />
            </MemoryRouter>
        );

        // ACT: Страница автоматически загружает данные при mount

        // ASSERT: Проверяем что все элементы отображаются правильно
        const historyItems = await screen.findAllByTestId('history-item');
        expect(historyItems).toHaveLength(2); // Соответствует historyMock

        // Проверяем что конкретные данные отображаются
        expect(screen.getByText(historyMock[0].fileName)).toBeInTheDocument();
        expect(screen.getByText(historyMock[1].fileName)).toBeInTheDocument();
    });

    /**
     * ТЕСТ-КЕЙС: MODAL DIALOG LIFECYCLE
     *
     * Тестирование сложных UI interactions:
     * - Event handling (click)
     * - Modal opening/closing
     * - DOM element lifecycle (появление/исчезновение)
     */
    it('TC-HY-002: Открытие и закрытие модального окна с деталями отчета', async () => {
        // ARRANGE
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HistoryPage />
            </MemoryRouter>
        );

        // ACT: Кликаем на элемент истории для открытия модального окна
        const successfulItem = screen.getByText(historyMock[0].fileName);
        fireEvent.click(successfulItem);

        // ASSERT: Проверяем открытие модального окна
        const modal = await screen.findByTestId('history-modal');
        expect(modal).toBeInTheDocument();

        // ACT: Закрываем модальное окно
        const closeButton = screen.getByTestId('modal-close-button');
        fireEvent.click(closeButton);

        // ASSERT: Проверяем что модальное окно исчезло из DOM
        // ВАЖНО: ожидаем исчезновения, а не просто скрытия
        await waitFor(() => {
            expect(screen.queryByTestId('history-modal')).not.toBeInTheDocument();
        });
    });

    /**
     * ТЕСТ-КЕЙС: DELETE OPERATIONS
     *
     * Проверяет интеграцию DELETE операций:
     * UI click → Store update → LocalStorage update → DOM re-render
     */
    it('TC-HY-003: Удаление одной записи из истории', async () => {
        // ARRANGE
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HistoryPage />
            </MemoryRouter>
        );

        // Проверяем начальное состояние
        let historyItems = await screen.findAllByTestId('history-item');
        expect(historyItems).toHaveLength(2);

        // ACT: Удаляем первый элемент
        const deleteButton = screen.getAllByTestId('history-item-delete-button')[0];
        fireEvent.click(deleteButton);

        // ASSERT: Проверяем что количество элементов уменьшилось
        historyItems = await screen.findAllByTestId('history-item');
        expect(historyItems).toHaveLength(1);

        // Проверяем что конкретно удаленный элемент исчез
        expect(screen.queryByText(historyMock[0].fileName)).not.toBeInTheDocument();
    });

    /**
     * ТЕСТ-КЕЙС: BULK OPERATIONS
     *
     * Проверяет массовые операции и transitions между состояниями UI.
     * "Полная очистка" переводит страницу из populated в empty state.
     */
    it('TC-HY-004: Полная очистка истории', async () => {
        // ARRANGE
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HistoryPage />
            </MemoryRouter>
        );

        // ACT: Выполняем полную очистку
        const clearAllButton = screen.getByTestId('clear-history-button');
        fireEvent.click(clearAllButton);

        // ASSERT: Проверяем переход к пустому состоянию
        await waitFor(() => {
            expect(screen.queryByTestId('history-item')).not.toBeInTheDocument();
        });

        // Проверяем что UI адаптировалось к пустому состоянию
        expect(screen.queryByTestId('clear-history-button')).not.toBeInTheDocument();
    });

    /**
     * ТЕСТ-КЕЙС: CONDITIONAL BEHAVIOR
     *
     * Проверяет что UI ведет себя по-разному в зависимости от типа данных.
     * Элементы с ошибками не должны открывать модальные окна.
     */
    it('TC-HY-005: Клик по записи с ошибкой не открывает модальное окно', async () => {
        // ARRANGE
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HistoryPage />
            </MemoryRouter>
        );

        // ACT: Кликаем на элемент с ошибкой (второй в historyMock)
        const failedItem = screen.getByText(historyMock[1].fileName);
        fireEvent.click(failedItem);

        // ASSERT: Модальное окно НЕ должно открываться
        const modal = screen.queryByTestId('history-modal');
        expect(modal).not.toBeInTheDocument();
    });

    /**
     * ТЕСТ-КЕЙС: NAVIGATION INTEGRATION
     *
     * Тестирование навигации между страницами.
     * Требует настройки Routes для полноценного тестирования routing.
     */
    it('TC-HY-006: Кнопка "Сгенерировать больше" перенаправляет на страницу генерации', async () => {
        // ARRANGE: Настраиваем Routes для тестирования навигации
        render(
            <MemoryRouter
                initialEntries={['/history']} // Стартуем на странице истории
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <Routes>
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/generate" element={<GeneratePage />} />
                </Routes>
            </MemoryRouter>
        );

        // ACT: Кликаем на кнопку навигации
        const generateMoreButton = screen.getByTestId('generate-more-button');
        fireEvent.click(generateMoreButton);

        // ASSERT: Проверяем что произошел переход на страницу генерации
        await waitFor(() => {
            expect(screen.getByTestId('generate-button')).toBeInTheDocument();
        });
    });

    /**
     * ТЕСТ-КЕЙС: EMPTY STATE TESTING
     *
     * Проверяет отображение пустого состояния когда нет данных.
     * Важность тестирования edge cases.
     */
    it('TC-HY-007: Отображение пустой страницы истории', async () => {
        // ARRANGE: Очищаем localStorage для имитации пустой истории
        localStorageMock.clear();

        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <HistoryPage />
            </MemoryRouter>
        );

        // ASSERT: Проверяем empty state UI
        // Кнопка очистки не должна отображаться если нечего очищать
        expect(screen.queryByTestId('clear-history-button')).not.toBeInTheDocument();

        // Но кнопка "генерировать больше" должна быть доступна
        expect(screen.getByTestId('generate-more-button')).toBeInTheDocument();
    });
});
