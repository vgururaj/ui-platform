import type { Meta, StoryObj } from '@storybook/react';
import { BarChart, PieChart, type ChartDatum } from './chart';

const sample: ChartDatum[] = [
  { name: 'Alpha', value: 40 },
  { name: 'Beta', value: 25 },
  { name: 'Gamma', value: 20 },
  { name: 'Delta', value: 15 },
];

const meta = {
  title: 'Components/Charts',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pie: Story = {
  render: () => (
    <div className="w-[420px]">
      <PieChart data={sample} height={280} />
    </div>
  ),
};

export const Bar: Story = {
  render: () => (
    <div className="w-[420px]">
      <BarChart data={sample} height={280} />
    </div>
  ),
};
