import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { HomePage } from '../HomePage';

describe('Интеграционные тесты для HomePage', () => {
    it('TC-HP-003: Попытка загрузки файла с неверным расширением', async () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        const fileInput = screen.getByTestId('dropzone-input');
        const invalidFile = new File(['hello'], 'invalid-file.txt', { type: 'text/plain' });

        fireEvent.change(fileInput, {
            target: { files: [invalidFile] },
        });

        const errorMessage = await screen.findByText('Можно загружать только *.csv файлы');
        expect(errorMessage).toBeInTheDocument();
    });

    it('TC-HP-004: Кнопка "Отправить" неактивна до выбора файла', async () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        const sendButton = screen.queryByTestId('send-button');
        expect(sendButton).not.toBeInTheDocument();
    });

    it('TC-HP-005: Отображение ошибки при сбое обработки на сервере', async () => {
        const errorMessage = 'Неизвестная ошибка парсинга :(';
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ message: errorMessage }),
            })
        );

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        const fileInput = screen.getByTestId('dropzone-input');
        const validFile = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(fileInput, { target: { files: [validFile] } });

        const sendButton = await screen.findByTestId('send-button');
        fireEvent.click(sendButton);

        await waitFor(() => {
            const error = screen.getByText(errorMessage);
            expect(error).toBeInTheDocument();
        });
    });

    it('TC-HP-006: Сброс выбранного файла', async () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        const fileInput = screen.getByTestId('dropzone-input');
        const validFile = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
        fireEvent.change(fileInput, { target: { files: [validFile] } });

        const fileNameElementBefore = await screen.findByText('test.csv');
        expect(fileNameElementBefore).toBeInTheDocument();

        const clearButton = screen.getByTestId('dropzone-clear-button');
        fireEvent.click(clearButton);

        const fileNameElementAfter = screen.queryByText('test.csv');
        expect(fileNameElementAfter).not.toBeInTheDocument();

        const sendButton = screen.queryByTestId('send-button');
        expect(sendButton).not.toBeInTheDocument();
    });
});
