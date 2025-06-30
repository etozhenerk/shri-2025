import { HistoryItem } from '../HistoryItem';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
    title: 'UI/HistoryItem',
    component: HistoryItem,
    tags: ['autodocs'],
    argTypes: {
        hasHighlights: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof HistoryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHighlights: Story = {
    args: {
        fileName: 'very_long_file_name_that_should_be_truncated.csv',
        date: '20.04.2024',
        hasHighlights: true,
        onClick: () => alert('Clicked!'),
        onDelete: () => alert('Deleted!'),
    },
};

export const WithoutHighlights: Story = {
    args: {
        fileName: 'another_file.csv',
        date: '19.04.2024',
        hasHighlights: false,
        onClick: () => alert('Clicked!'),
        onDelete: () => alert('Deleted!'),
    },
}; 