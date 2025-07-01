import { GeneratePage } from '@pages/Generate';
import { useHistoryStore } from '@store/historyStore';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { historyMock } from '@tests/test-data/mocks/history';
import { STORAGE_KEY } from '@utils/consts';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';

import { HistoryPage } from '../HistoryPage';

// Мокируем localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
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
        getStore() {
            return store;
        },
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const initialHistoryState = useHistoryStore.getState();

describe('Интеграционные тесты для HistoryPage', () => {
    beforeEach(() => {
        localStorageMock.clear();
        localStorageMock.setItem(STORAGE_KEY, JSON.stringify(historyMock));

        // Сбрасываем состояние стора перед каждым тестом
        useHistoryStore.setState(initialHistoryState, true);
    });

    it('TC-HY-001: Отображение списка записей в истории', async () => {
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
        const historyItems = await screen.findAllByTestId('history-item');
        expect(historyItems).toHaveLength(2);
        expect(screen.getByText(historyMock[0].fileName)).toBeInTheDocument();
        expect(screen.getByText(historyMock[1].fileName)).toBeInTheDocument();
    });

    it('TC-HY-002: Открытие и закрытие модального окна с деталями отчета', async () => {
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
        const successfulItem = screen.getByText(historyMock[0].fileName);
        fireEvent.click(successfulItem);

        const modal = await screen.findByTestId('history-modal');
        expect(modal).toBeInTheDocument();

        const closeButton = screen.getByTestId('modal-close-button');
        fireEvent.click(closeButton);

        // Ожидаем исчезновения, а не просто скрытия
        await waitFor(() => {
            expect(screen.queryByTestId('history-modal')).not.toBeInTheDocument();
        });
    });

    it('TC-HY-003: Удаление одной записи из истории', async () => {
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
        let historyItems = await screen.findAllByTestId('history-item');
        expect(historyItems).toHaveLength(2);

        const deleteButton = screen.getAllByTestId('history-item-delete-button')[0];
        fireEvent.click(deleteButton);

        historyItems = await screen.findAllByTestId('history-item');
        expect(historyItems).toHaveLength(1);
        expect(screen.queryByText(historyMock[0].fileName)).not.toBeInTheDocument();
    });

    it('TC-HY-004: Полная очистка истории', async () => {
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
        const clearAllButton = screen.getByTestId('clear-history-button');
        fireEvent.click(clearAllButton);

        await waitFor(() => {
            expect(screen.queryByTestId('history-item')).not.toBeInTheDocument();
        });

        expect(screen.queryByTestId('clear-history-button')).not.toBeInTheDocument();
    });

    it('TC-HY-005: Клик по записи с ошибкой не открывает модальное окно', async () => {
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
        const failedItem = screen.getByText(historyMock[1].fileName);

        fireEvent.click(failedItem);

        const modal = screen.queryByTestId('history-modal');
        expect(modal).not.toBeInTheDocument();
    });

    it('TC-HY-006: Кнопка "Сгенерировать больше" перенаправляет на страницу генерации', async () => {
        render(
            <MemoryRouter
                initialEntries={['/history']}
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
        const generateMoreButton = screen.getByTestId('generate-more-button');
        fireEvent.click(generateMoreButton);

        await waitFor(() => {
            expect(screen.getByTestId('generate-button')).toBeInTheDocument();
        });
    });

    it('TC-HY-007: Отображение пустой страницы истории', async () => {
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

        expect(screen.queryByTestId('clear-history-button')).not.toBeInTheDocument();
        expect(screen.getByTestId('generate-more-button')).toBeInTheDocument();
    });
});
