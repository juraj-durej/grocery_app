import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { WelcomeSlides } from '@/components/WelcomeSlides';
import { parseSlideParam, SLIDE_COUNT } from '@/utils/Slides';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'IndexPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function IndexPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slide?: string | string[] }>;
}) {
  const { locale } = await props.params;
  const { slide } = await props.searchParams;
  setRequestLocale(locale);

  const initialIndex = parseSlideParam(slide, SLIDE_COUNT);

  return <WelcomeSlides key={initialIndex} initialIndex={initialIndex} />;
}
