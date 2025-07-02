import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, test, expect } from 'vitest';

import { Modal } from './Modal';

describe('Доступность компонента Modal', () => {
    test('не должен иметь нарушений доступности в открытом состоянии', async () => {
        // Arrange
        const { container } = render(
            <Modal isOpen={true} onClose={() => {}}>
                <div>Контент модального окна</div>
            </Modal>
        );

        // Act
        const results = await axe(container);

        // Assert
        expect(results.violations.length).toBe(0);
    });
});
