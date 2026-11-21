import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { connection } from 'next/server';
import { PageHeader } from '@/components/PageHeader';
import { getCategories } from '@/libs/Catalog';
import { Link } from '@/libs/I18nNavigation';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'CategoriesPage' });

  return { title: t('title') };
}

export default async function CategoriesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  await connection();
  const t = await getTranslations({ locale, namespace: 'CategoriesPage' });
  const categories = await getCategories();

  return (
    <>
      <PageHeader title={t('title')} />
      <ul className="grid grid-cols-2 justify-items-center gap-4.5 px-4.25">
        {categories.map((category) => (
          <li key={category.id} className="w-full">
            <Link
              href={`/categories/${category.slug}`}
              className="flex h-30 flex-col items-center justify-center gap-3 bg-white"
            >
              <span
                className="flex size-16.5 items-center justify-center rounded-full"
                style={{ backgroundColor: category.color }}
              >
                <Image src={category.iconUrl} alt="" width={32} height={32} className="size-8" />
              </span>
              <span className="text-body-lg font-medium text-text-strong">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
