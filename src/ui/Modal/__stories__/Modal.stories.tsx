import { useState } from 'react';

import { Button } from '@ui/Button';
import { Typography } from '@ui/Typography';

import { Modal } from '../Modal';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: false, // Управляется через play-функцию и состояние
    },
    children: {
      control: false,
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: false, // Это значение по умолчанию для args, реальное состояние управляется локально
  },
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Typography as="h3" size="l" weight="bold">
            Modal Title
          </Typography>
          <Typography as="p" size="m" className="mt-4">
            This is the content of the modal window. You can close it by clicking the cross icon or outside the
            modal.
          </Typography>
        </Modal>
      </>
    );
  },
}; 