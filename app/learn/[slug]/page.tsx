import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { learnSource } from '@/lib/learn';

export default async function Page(props: PageProps<'/learn/[slug]'>) {
  const params = await props.params;
  const page = learnSource.getPage([params.slug]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsLayout tree={learnSource.getPageTree()} {...baseOptions()}>
      <DocsPage toc={page.data.toc}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    </DocsLayout>
  );
}

export async function generateStaticParams() {
  return learnSource.generateParams().map((param) => ({
    slug: param.slug[0],
  }));
}

export async function generateMetadata(
  props: PageProps<'/learn/[slug]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = learnSource.getPage([params.slug]);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
