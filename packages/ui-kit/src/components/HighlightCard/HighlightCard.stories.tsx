import { HighlightCard } from '../HighlightCard';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
    title: 'UI/HighlightCard',
    component: HighlightCard,
    tags: ['autodocs'],
    argTypes: {
        className: {
            table: {
                disable: true,
            },
        },
    },
} satisfies Meta<typeof HighlightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Среднее время обработки',
        description: '42 секунды',
    },
}; 