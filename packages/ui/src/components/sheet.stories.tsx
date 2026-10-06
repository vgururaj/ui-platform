import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Mobile nav / drawer</SheetTitle>
          <SheetDescription>Used for hamburger menus and side panels.</SheetDescription>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          <a href="#home">Home</a>
          <a href="#items">Items</a>
          <a href="#settings">Settings</a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};
