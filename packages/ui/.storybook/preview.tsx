import type { Preview } from '@storybook/react';
import React from 'react';
import { TooltipProvider } from '../src/components/tooltip';
import { Toaster } from '../src/components/toast';
import '../src/styles/globals.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || 'light';
      const isDark = theme === 'dark';
      return (
        <div
          className={isDark ? 'dark' : undefined}
          style={{
            color: 'hsl(var(--foreground))',
            background: 'hsl(var(--background))',
            minHeight: '100%',
          }}
        >
          <TooltipProvider>
            <div className="min-w-[280px] p-4">
              <Story />
            </div>
            <Toaster />
          </TooltipProvider>
        </div>
      );
    },
  ],
};

export default preview;
