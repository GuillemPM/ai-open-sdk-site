'use client';

import Image from 'next/image';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';

const SIZES =
  '(min-width: 1280px) 440px, (min-width: 1024px) 390px, (min-width: 640px) 340px, 240px';

// Fades the plate's edges so the opaque asset does not end in a hard rectangle.
const MASK = 'mask-x-from-90% mask-x-to-97% mask-y-from-85% mask-y-to-97%';

/**
 * The hero mark, doubling as a theme toggle. Each theme has its own opaque
 * plate, swapped in CSS so the correct one is painted before hydration.
 */
export function HeroMark() {
  const { resolvedTheme, setTheme } = useTheme();

  // Same route fumadocs' own theme switch takes: the provider sets
  // disableTransitionOnChange, so CSS transitions are suppressed mid-swap and
  // the cross-fade has to come from a view transition. flushSync forces the
  // theme to land inside the transition rather than on a later render.
  function toggleTheme() {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';

    if (document.startViewTransition) {
      document.startViewTransition(() => flushSync(() => setTheme(next)));
    } else {
      setTheme(next);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // A static label: deriving it from the current theme would not match what
      // the server rendered, since the resolved theme is unknown until mount.
      aria-label="Toggle theme"
      title="Toggle theme"
      className="aios-hero-mark block w-full cursor-pointer appearance-none rounded-2xl border-0 bg-transparent p-0 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none"
    >
      <Image
        src="/hero/aiopensdk-logo-light.webp"
        alt=""
        width={627}
        height={627}
        sizes={SIZES}
        quality={100}
        unoptimized
        priority
        className={`aios-hero-mark-img aios-hero-mark-img-light ${MASK}`}
      />
      <Image
        src="/hero/aiopensdk-logo.webp"
        alt=""
        width={627}
        height={627}
        sizes={SIZES}
        quality={100}
        unoptimized
        priority
        className={`aios-hero-mark-img aios-hero-mark-img-dark ${MASK}`}
      />
    </button>
  );
}
