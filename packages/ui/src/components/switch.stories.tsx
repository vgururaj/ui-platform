import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './switch';
import { Label } from './label';

const meta = {
  title: 'Components/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-2">
      <Switch id="notifications" checked={on} onCheckedChange={setOn} />
      <Label htmlFor="notifications">Notifications</Label>
    </div>
  );
}

export const Default: Story = {
  render: () => <SwitchDemo />,
};
