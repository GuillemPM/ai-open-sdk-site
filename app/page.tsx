import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { HeroCode } from '@/components/hero-code';
import { baseOptions, GITHUB_URL } from '@/lib/layout.shared';

const features = [
  {
    title: 'Provider-agnostic',
    body: 'Swap Anthropic, OpenAI, OpenCode Zen, Mock, or your own adapter without rewriting callers.',
  },
  {
    title: 'Structured output',
    body: 'JSON Schema validation as a first-class primitive, with optional RecRef binding.',
  },
  {
    title: 'Tools & retries',
    body: 'Automatic tool loops, SecretText keys, and shared backoff for rate limits and timeouts.',
  },
  {
    title: 'Testable by design',
    body: 'Mock provider so AI-dependent AL code ships with tests. No live keys required.',
  },
];

const providers = [
  'Anthropic',
  'OpenAI',
  'Gemini',
  'xAI',
  'DeepSeek',
  'OpenCode Zen',
  'Mock',
  'Custom',
];

export default function Home() {
  return (
    <HomeLayout
      {...baseOptions()}
      className="bg-fd-background text-fd-foreground"
    >
      <section className="px-4 pt-16 pb-16 sm:px-6 sm:pt-24 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="aios-fade-up text-5xl font-semibold tracking-tight sm:text-7xl sm:leading-[1.02]">
            AI Open SDK
          </h1>
          <p className="aios-fade-up mt-3 text-lg font-medium tracking-tight text-fd-foreground/80 sm:text-2xl">
            for Business Central
          </p>
          <p className="aios-fade-up-delay mx-auto mt-6 max-w-2xl text-lg text-fd-muted-foreground sm:text-xl sm:leading-relaxed">
            Call any LLM from AL through one client API: structured output,
            tools, retries, and a mock provider. Core plus provider
            extensions you install as needed, not Copilot.
          </p>
          <div className="aios-fade-up-delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/getting-started"
              className={`${buttonVariants({ color: 'primary' })} h-10 px-5`}
            >
              Get Started
            </Link>
            <Link
              href="/docs"
              className={`${buttonVariants({ color: 'ghost' })} h-10 px-4 text-fd-muted-foreground`}
            >
              Documentation
            </Link>
          </div>
        </div>

        <div className="aios-fade-up-delay-2 aios-hero-frame mx-auto mt-14 max-w-3xl p-3 sm:mt-16 sm:max-w-4xl sm:p-4">
          <div className="aios-atmosphere" aria-hidden>
            <div className="aios-mesh" />
            <div className="aios-grain" />
          </div>
          <div className="relative">
            <HeroCode />
          </div>
        </div>

        <p className="aios-fade-up-delay-2 mx-auto mt-5 max-w-2xl text-center text-sm text-fd-muted-foreground">
          Same client API across{' '}
          {providers.map((name, i) => (
            <span key={name}>
              {i > 0 && (i === providers.length - 1 ? ' & ' : ', ')}
              <span className="text-fd-foreground/80">{name}</span>
            </span>
          ))}
          .
        </p>
      </section>

      <section className="border-t border-fd-border">
        <div className="mx-auto grid max-w-6xl divide-y divide-fd-border sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
          {features.map((feature) => (
            <div key={feature.title} className="px-6 py-10 sm:px-8">
              <h2 className="text-base font-semibold tracking-tight">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-fd-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-fd-border px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why it exists
          </h2>
          <p className="mt-5 text-base leading-relaxed text-fd-muted-foreground sm:text-lg">
            System.AI and Copilot are right for Microsoft-hosted capabilities.
            AI Open SDK is for everything else: third-party providers,
            self-hosted endpoints, and AI logic you can unit-test without
            network or API keys.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs/getting-started"
              className={`${buttonVariants({ color: 'primary' })} h-10 px-5`}
            >
              Start building
            </Link>
            <Link
              href="/learn"
              className={`${buttonVariants({ color: 'secondary' })} h-10 px-5`}
            >
              Learn
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-fd-border px-4 py-10 text-sm text-fd-muted-foreground sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>AI Open SDK. MIT License. Open source for Business Central.</p>
          <div className="flex gap-5">
            <Link href="/docs" className="hover:text-fd-foreground">
              Docs
            </Link>
            <Link href="/learn" className="hover:text-fd-foreground">
              Learn
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fd-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </HomeLayout>
  );
}
