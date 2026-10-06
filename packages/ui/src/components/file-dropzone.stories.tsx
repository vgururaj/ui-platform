import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileDropzone } from './file-dropzone';

const meta = {
  title: 'Components/FileDropzone',
  component: FileDropzone,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

function FileDropzoneDemo() {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div className="w-[420px] space-y-3">
      <FileDropzone
        hint="PNG, JPG, or PDF up to 10MB"
        onFiles={(files) => setNames(files.map((f) => f.name))}
      />
      {names.length > 0 ? (
        <ul className="text-sm text-muted-foreground">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export const Default: Story = {
  render: () => <FileDropzoneDemo />,
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Uploads disabled' },
};
