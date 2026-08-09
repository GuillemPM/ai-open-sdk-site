import type { ReactNode } from 'react';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const GITHUB_URL = 'https://github.com/GuillemPM/AL-AI-Toolkit';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex flex-col leading-tight">
          <span className="font-semibold tracking-tight">AI Open SDK</span>
          <span className="text-[11px] font-normal text-fd-muted-foreground">
            for Business Central
          </span>
        </span>
      ) as ReactNode,
      url: '/',
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Learn',
        url: '/learn',
        active: 'nested-url',
      },
    ],
    githubUrl: GITHUB_URL,
  };
}
