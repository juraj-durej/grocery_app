import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';

export const SearchBar = async () => {
  const t = await getTranslations('SearchBar');

  return (
    <div className="relative h-12.5 rounded-field bg-surface">
      <Link
        href="/search"
        className="flex h-full items-center gap-4.75 pl-5.25 text-body-lg font-medium text-text-muted"
      >
        <Image src="/icons/loupe.svg" alt="" width={20} height={20} />
        {t('placeholder')}
      </Link>
      <Link
        href="/filter"
        aria-label={t('filter')}
        className="absolute top-0 right-0 flex h-full w-16 items-center justify-center"
      >
        <Image src="/icons/filter.svg" alt="" width={19} height={17} />
      </Link>
    </div>
  );
};
