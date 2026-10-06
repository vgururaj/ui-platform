import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';

const meta = {
  title: 'Components/Label',
  component: Label,
  args: {
    children: 'Email',
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHtmlFor: Story = {
  args: {
    htmlFor: 'email',
    children: 'Email address',
  },
};
