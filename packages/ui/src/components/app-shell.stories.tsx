import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './app-shell';
import { Button } from './button';

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AppShell
      className="min-h-[480px]"
      sidebar={
        <div className="flex flex-col gap-2 p-4 text-sm">
          <strong className="mb-2">ui-platform</strong>
          <a href="#home">Home</a>
          <a href="#items">Items</a>
          <a href="#settings">Settings</a>
        </div>
      }
      header={
        <div className="flex w-full items-center justify-between">
          <span className="font-medium">Demo header</span>
          <Button size="sm" variant="outline">
            Action
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">Main content area.</p>
    </AppShell>
  ),
};
