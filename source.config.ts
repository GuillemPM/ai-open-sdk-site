import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { defineConfig } from 'fumadocs-mdx/config';
import { alLanguage } from './lib/al-language';

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      langs: [alLanguage],
      langAlias: {
        ...rehypeCodeDefaultOptions.langAlias,
        businesscentral: 'al',
      },
    },
  },
});
