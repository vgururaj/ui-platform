import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { toast } from './toast';

const meta = {
  title: 'Components/Toast',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button onClick={() => toast.success('Saved successfully')}>Success</Button>
      <Button variant="destructive" onClick={() => toast.error('Something failed')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.message('Plain message')}>
        Message
      </Button>
    </div>
  ),
};
