import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { GeneratePage } from '../';

describe('Интеграционные тесты для GeneratePage', () => {
    it('TC-GP-002: Отображение ошибки при сбое генерации на сервере', async () => {
        const errorText = 'Произошла серьезная ошибка';
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: errorText }),
            })
        );

        render(
            <MemoryRouter>
                <GeneratePage />
            </MemoryRouter>
        );

        const generateButton = screen.getByTestId('generate-button');
        fireEvent.click(generateButton);

        await waitFor(() => {
            const errorMessage = screen.getByText(`Произошла ошибка: ${errorText}`);
            expect(errorMessage).toBeInTheDocument();
        });

        expect(generateButton).toBeEnabled();
    });
}); 