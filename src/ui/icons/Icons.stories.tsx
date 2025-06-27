import { Clear } from './Clear';
import { Create } from './Create';
import { Cross } from './Cross';
import { File } from './File';
import { History } from './History';
import { Smile } from './Smile';
import { SmileSad } from './SmileSad';
import { Trash } from './Trash';
import { Upload } from './Upload';

import type { Meta } from '@storybook/react';

const meta = {
  title: 'UI/Icons',
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#333' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

const Template = (args: { size: number }) => (
  <>
    <div style={{ textAlign: 'center' }}>
      <Clear {...args} />
      <p>Clear</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Create {...args} />
      <p>Create</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Cross {...args} />
      <p>Cross</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <File {...args} />
      <p>File</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <History {...args} />
      <p>History</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Smile {...args} />
      <p>Smile</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <SmileSad {...args} />
      <p>SmileSad</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Trash {...args} />
      <p>Trash</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Upload {...args} />
      <p>Upload</p>
    </div>
  </>
);

export const Size24 = {
  render: Template,
  args: {
    size: 24,
  },
};

export const Size48 = {
  render: Template,
  args: {
    size: 48,
  },
}; 