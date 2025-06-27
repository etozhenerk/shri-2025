import { userEvent, within } from '@storybook/test';

import { Button } from '../Button';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'download', 'upload', 'clear'],
    },
    disabled: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Download: Story = {
  args: {
    variant: 'download',
    children: 'Download Button',
  },
};

export const Upload: Story = {
  args: {
    variant: 'upload',
    children: 'Upload Button',
  },
};

export const Clear: Story = {
  args: {
    variant: 'clear',
    children: 'Clear Button',
  },
};

export const Disabled: Story = {
  args: {
    ...Primary.args,
    disabled: true,
    children: 'Disabled Button',
  },
};

export const FullWidth: Story = {
  args: {
    ...Primary.args,
    fullWidth: true,
    children: 'Full Width Button',
  },
};

export const Hovered: Story = {
  ...Primary,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByTestId('ui-button'));
  },
};

export const Focused: Story = {
  ...Primary,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await canvas.getByTestId('ui-button').focus();
  },
};

export const WithLoader: Story = {
  args: {
    ...Primary.args,
    isLoading: true,
  },
}; 