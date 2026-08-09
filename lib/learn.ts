import { defineDocs } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';

const learn = defineDocs({
  dir: 'content/learn',
});

export const learnSource = loader({
  baseUrl: '/learn',
  source: learn.toFumadocsSource(),
});
