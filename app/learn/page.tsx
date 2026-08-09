import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { learnSource } from '@/lib/learn';

export default function LearnIndex() {
  const pages = learnSource.getPages();

  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-medium text-fd-muted-foreground">Learn</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
          Tutorials & release notes
        </h1>
        <p className="mt-4 text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
          Practical guides for building AI-powered Business Central extensions
          with AI Open SDK.
        </p>

        <ul className="mt-12 divide-y divide-fd-border border-y border-fd-border">
          {pages.map((page) => (
            <li key={page.url}>
              <Link
                href={page.url}
                className="group block py-6 transition-colors hover:bg-fd-accent/40"
              >
                <h2 className="text-lg font-semibold tracking-tight group-hover:underline">
                  {page.data.title}
                </h2>
                {page.data.description ? (
                  <p className="mt-2 text-sm text-fd-muted-foreground">
                    {page.data.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HomeLayout>
  );
}
