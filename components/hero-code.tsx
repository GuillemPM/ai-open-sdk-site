import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HERO_SNIPPET_META } from '@/lib/hero-examples';
import { HeroCodeSwitcher } from '@/components/hero-code-switcher';

export function HeroCode() {
  const snippets = HERO_SNIPPET_META.map((meta) => ({
    capabilityId: meta.capabilityId,
    providerId: meta.providerId,
    filename: meta.filename,
    code: readFileSync(
      join(
        process.cwd(),
        'content/al/hero',
        meta.capabilityId,
        `${meta.providerId}.al`,
      ),
      'utf8',
    ).replace(/\n$/, ''),
  }));

  return <HeroCodeSwitcher snippets={snippets} />;
}
