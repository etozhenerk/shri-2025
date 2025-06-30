import { Typography } from '../Typography';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'UI/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
    size: {
      control: 'select',
      options: ['xxs', 'xs', 's', 'm', 'l', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'bold', 'extrabold'],
    },
    color: {
      control: 'select',
      options: ['dark', 'light', 'purple', 'error'],
    },
    style: {
      control: 'radio',
      options: ['normal', 'italic'],
    },
    maxRowsNumber: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

export const SizeL: Story = {
  args: {
    ...Default.args,
    size: 'l',
  },
};

export const SizeS: Story = {
  args: {
    ...Default.args,
    size: 's',
  },
};

export const ColorLight: Story = {
  args: {
    ...Default.args,
    color: 'light',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const ColorError: Story = {
  args: {
    ...Default.args,
    color: 'error',
  },
};

export const WeightBold: Story = {
  args: {
    ...Default.args,
    weight: 'bold',
  },
};

export const StyleItalic: Story = {
  args: {
    ...Default.args,
    style: 'italic',
  },
};

export const AsH1: Story = {
  args: {
    ...Default.args,
    as: 'h1',
    size: 'xl',
    weight: 'bold',
  },
};

export const LineClamp: Story = {
  args: {
    ...Default.args,
    maxRowsNumber: 1,
  },
}; 