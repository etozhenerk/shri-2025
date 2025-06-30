import { FileStatus } from '../FileStatus';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
    title: 'UI/FileStatus',
    component: FileStatus,
    tags: ['autodocs'],
    argTypes: {
        isActive: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof FileStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
    args: {
        type: 'success',
        isActive: true,
        children: 'Обработан успешно',
    },
};

export const Error: Story = {
    args: {
        type: 'error',
        isActive: true,

        children: 'Не удалось обработать',
    },
}; 