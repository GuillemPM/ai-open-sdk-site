'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import type { HighlighterCore } from 'shiki';
import { createHighlighter } from 'shiki';
import { ShikiMagicMove } from '@shikijs/magic-move/react';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { ProviderLogo } from '@/components/provider-logo';
import { alLanguage } from '@/lib/al-language';
import type {
  HeroCapabilityId,
  HeroProviderId,
  HeroSourceMode,
} from '@/lib/hero-examples';
import {
  HERO_CAPABILITIES,
  HERO_SOURCE_OPTIONS,
  providersForMode,
} from '@/lib/hero-examples';
import '@shikijs/magic-move/style.css';

type Snippet = {
  capabilityId: HeroCapabilityId;
  providerId: HeroProviderId;
  filename: string;
  code: string;
};

export function HeroCodeSwitcher({ snippets }: { snippets: Snippet[] }) {
  const { resolvedTheme } = useTheme();
  const [capabilityId, setCapabilityId] =
    useState<HeroCapabilityId>('generate-text');
  const [sourceMode, setSourceMode] = useState<HeroSourceMode>('providers');
  const [providerId, setProviderId] = useState<HeroProviderId>('anthropic');
  // Drives the provider icon carousel: which logo is leaving, which way it goes,
  // and a key that remounts the pair so a rapid second click restarts the slide.
  // Null whenever the provider changed by some means other than the arrows, so
  // that change cross-fades instead of sliding a direction it never had.
  const [slide, setSlide] = useState<{
    from: HeroProviderId;
    direction: -1 | 1;
    key: number;
  } | null>(null);
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  // next-themes is undefined until mounted; avoid flashing the wrong Shiki theme.
  const [themeReady, setThemeReady] = useState(false);

  const availableProviders = useMemo(
    () => providersForMode(sourceMode, capabilityId),
    [sourceMode, capabilityId],
  );

  useEffect(() => {
    if (!availableProviders.some((provider) => provider.id === providerId)) {
      setProviderId(availableProviders[0]?.id ?? 'openai');
    }
  }, [availableProviders, providerId]);

  useEffect(() => {
    let cancelled = false;

    createHighlighter({
      langs: [alLanguage],
      themes: ['github-light', 'github-dark'],
    }).then((instance) => {
      if (!cancelled) setHighlighter(instance);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  const activeProvider =
    availableProviders.find((provider) => provider.id === providerId) ??
    availableProviders[0];

  const activeSnippet =
    snippets.find(
      (snippet) =>
        snippet.capabilityId === capabilityId &&
        snippet.providerId === activeProvider?.id,
    ) ?? snippets[0];

  const showProviderSwitcher =
    sourceMode === 'providers' && availableProviders.length > 0;

  const shikiTheme =
    resolvedTheme === 'dark' ? 'github-dark' : 'github-light';

  function cycleProvider(direction: -1 | 1) {
    if (!activeProvider || availableProviders.length === 0) return;
    const index = availableProviders.findIndex(
      (provider) => provider.id === activeProvider.id,
    );
    const next =
      availableProviders[
        (index + direction + availableProviders.length) %
          availableProviders.length
      ];
    setSlide((previous) => ({
      from: activeProvider.id,
      direction,
      key: (previous?.key ?? 0) + 1,
    }));
    setProviderId(next.id);
  }

  return (
    <div className="relative space-y-3">
      <div className="flex min-h-9 items-center justify-between gap-3">
        <div
          className="flex min-w-0 flex-1 items-center gap-3.5 overflow-x-auto text-fd-muted-foreground"
          role="tablist"
          aria-label="API"
        >
          {HERO_CAPABILITIES.map((capability) => {
            const selected = capability.id === capabilityId;
            return (
              <button
                key={capability.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setCapabilityId(capability.id);
                  setSlide(null);
                }}
                className={[
                  'relative shrink-0 px-0.5 py-1.5 text-sm font-medium transition-colors',
                  'hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring',
                  selected
                    ? 'text-fd-primary'
                    : 'text-fd-muted-foreground',
                ].join(' ')}
              >
                {capability.label}
                <span
                  className={[
                    'absolute inset-x-0 bottom-0 h-px',
                    selected ? 'bg-fd-primary' : 'bg-transparent',
                  ].join(' ')}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <div className="flex h-9 shrink-0 items-center justify-end">
          {showProviderSwitcher ? (
            <div className="flex items-center gap-0.5" aria-label="Provider">
              {availableProviders.length > 1 ? (
                <button
                  type="button"
                  onClick={() => cycleProvider(-1)}
                  className={`${buttonVariants({
                    color: 'ghost',
                    size: 'icon-sm',
                  })} aios-arrow-press`}
                  aria-label="Previous provider"
                >
                  <span className="aios-arrow-nudge" data-direction={-1}>
                    <ChevronLeft />
                  </span>
                </button>
              ) : null}

              <div
                className="relative size-9 overflow-hidden rounded-md border bg-fd-secondary text-fd-secondary-foreground"
                title={activeProvider?.label}
              >
                {/* The outgoing logo is left mounted at the end of its slide,
                    where it is off-frame and clipped, rather than torn out on
                    animationend: one less state change mid-animation. */}
                {slide ? (
                  <span
                    key={`out-${slide.key}`}
                    className="aios-provider-out absolute inset-0 grid place-items-center"
                    data-direction={slide.direction}
                    aria-hidden
                  >
                    <ProviderLogo id={slide.from} className="size-4" />
                  </span>
                ) : null}

                {activeProvider ? (
                  <span
                    key={`in-${slide?.key ?? 0}-${activeProvider.id}`}
                    className="aios-provider-in absolute inset-0 grid place-items-center"
                    data-direction={slide?.direction ?? 0}
                  >
                    <ProviderLogo id={activeProvider.id} className="size-4" />
                  </span>
                ) : null}
              </div>

              {availableProviders.length > 1 ? (
                <button
                  type="button"
                  onClick={() => cycleProvider(1)}
                  className={`${buttonVariants({
                    color: 'ghost',
                    size: 'icon-sm',
                  })} aios-arrow-press`}
                  aria-label="Next provider"
                >
                  <span className="aios-arrow-nudge" data-direction={1}>
                    <ChevronRight />
                  </span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="aios-code-panel relative overflow-hidden rounded-xl border bg-fd-card text-left text-sm text-fd-card-foreground shadow-sm">
        <div className="flex h-9.5 items-center justify-between gap-3 border-b px-3 text-fd-muted-foreground sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/25" />
            <span className="ml-2 truncate font-mono text-[11px]">
              {activeSnippet.filename}
            </span>
          </div>

          <div className="relative shrink-0">
            <label className="sr-only" htmlFor="hero-source-mode">
              Source
            </label>
            <select
              id="hero-source-mode"
              value={sourceMode}
              onChange={(event) => {
                setSourceMode(event.target.value as HeroSourceMode);
                setSlide(null);
              }}
              className="h-7 appearance-none rounded-md border border-fd-border bg-fd-secondary py-0.5 pr-7 pl-2.5 text-[11px] font-medium text-fd-secondary-foreground outline-none transition-colors hover:bg-fd-accent focus:border-fd-ring"
            >
              {HERO_SOURCE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-fd-muted-foreground">
              <SelectChevron />
            </span>
          </div>
        </div>

        <div
          role="tabpanel"
          className="aios-magic-move overflow-x-auto py-3.5 pe-4 ps-3 sm:pe-5 sm:ps-4"
        >
          {highlighter && themeReady ? (
            <ShikiMagicMove
              // Magic Move caches theme in a ref on mount; remount when it changes
              // so light mode does not keep dark-theme (near-white) token colors.
              key={shikiTheme}
              lang="al"
              theme={shikiTheme}
              highlighter={highlighter}
              code={activeSnippet.code}
              className="aios-magic-move-code"
              options={{
                duration: reduceMotion ? 0 : 550,
                stagger: reduceMotion ? 0 : 0.25,
                lineNumbers: true,
                containerStyle: false,
                animateContainer: !reduceMotion,
              }}
            />
          ) : (
            <pre className="m-0 font-mono text-[12px] leading-6 whitespace-pre text-fd-muted-foreground sm:text-[13px]">
              {activeSnippet.code}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectChevron() {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden>
      <path fill="currentColor" d="M2.2 4.2 6 8l3.8-3.8-.8-.8L6 6.4 3 3.4l-.8.8Z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path
        fill="currentColor"
        d="M10.2 3.2 5.4 8l4.8 4.8.9-.9L7.2 8l3.9-3.9-.9-.9Z"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
      <path
        fill="currentColor"
        d="m5.8 3.2-.9.9L8.8 8l-3.9 3.9.9.9L10.6 8 5.8 3.2Z"
      />
    </svg>
  );
}
