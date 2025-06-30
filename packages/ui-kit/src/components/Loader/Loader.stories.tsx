import { Loader } from '../Loader';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'UI/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 60,
  },
};

export const Large: Story = {
  args: {
    size: 100,
  },
};

export const Small: Story = {
  args: {
    size: 20,
  },
}; 